from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import os
import hashlib
import jwt
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VENTANILLA RECICLA CONTIGO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)
db = client.recicla_contigo_db

# JWT Configuration
SECRET_KEY = "recicla_contigo_secret_key_2024"
ALGORITHM = "HS256"

# Pydantic Models
class UserRegister(BaseModel):
    nombre: str
    email: str
    password: str
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    foto_perfil: Optional[str] = None

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    foto_perfil: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class ReporteCreate(BaseModel):
    descripcion: str
    foto_base64: str
    latitud: float
    longitud: float
    direccion: Optional[str] = None

class CanjearIncentivo(BaseModel):
    incentivo_id: str
    usuario_id: str

# Helper Functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode = {"user_id": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# Routes
@app.get("/")
def read_root():
    return {"message": "VENTANILLA RECICLA CONTIGO API - Cuidando nuestro planeta"}

@app.post("/api/usuarios")
def register_user(user: UserRegister):
    # Check if user exists
    existing_user = db.usuarios.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # Create new user
    hashed_password = hash_password(user.password)
    new_user = {
        "nombre": user.nombre,
        "email": user.email,
        "password": hashed_password,
        "latitud": user.latitud,
        "longitud": user.longitud,
        "foto_perfil": user.foto_perfil,
        "puntos": 0,
        "reportes_enviados": 0,
        "fecha_registro": datetime.utcnow(),
        "logros": []
    }
    
    result = db.usuarios.insert_one(new_user)
    user_id = str(result.inserted_id)
    
    # Create access token
    token = create_access_token(user_id)
    
    return {
        "message": "Usuario registrado exitosamente",
        "token": token,
        "user_id": user_id,
        "usuario": {
            "id": user_id,
            "nombre": user.nombre,
            "email": user.email,
            "puntos": 0
        }
    }

@app.post("/api/login")
def login_user(login_data: UserLogin):
    # Find user
    user = db.usuarios.find_one({"email": login_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Verify password
    hashed_password = hash_password(login_data.password)
    if user["password"] != hashed_password:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    # Create token
    user_id = str(user["_id"])
    token = create_access_token(user_id)
    
    return {
        "message": "Login exitoso",
        "token": token,
        "user_id": user_id,
        "usuario": {
            "id": user_id,
            "nombre": user["nombre"],
            "email": user["email"],
            "puntos": user.get("puntos", 0)
        }
    }

@app.get("/api/usuarios/{user_id}")
def get_user(user_id: str):
    from bson import ObjectId
    try:
        user = db.usuarios.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return {
            "id": str(user["_id"]),
            "nombre": user["nombre"],
            "email": user["email"],
            "puntos": user.get("puntos", 0),
            "reportes_enviados": user.get("reportes_enviados", 0),
            "logros": user.get("logros", []),
            "foto_perfil": user.get("foto_perfil", None),
            "fecha_registro": user.get("fecha_registro")
        }
    except Exception:
        raise HTTPException(status_code=400, detail="ID de usuario inválido")

@app.put("/api/usuarios/{user_id}")
def update_user(user_id: str, user_update: UserUpdate):
    from bson import ObjectId
    try:
        update_data = {}
        
        if user_update.nombre is not None:
            update_data["nombre"] = user_update.nombre
            
        if user_update.foto_perfil is not None:
            update_data["foto_perfil"] = user_update.foto_perfil
            
        if not update_data:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")
            
        result = db.usuarios.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
            
        # Return updated user data
        updated_user = db.usuarios.find_one({"_id": ObjectId(user_id)})
        return {
            "id": str(updated_user["_id"]),
            "nombre": updated_user["nombre"],
            "email": updated_user["email"],
            "puntos": updated_user.get("puntos", 0),
            "reportes_enviados": updated_user.get("reportes_enviados", 0),
            "logros": updated_user.get("logros", []),
            "foto_perfil": updated_user.get("foto_perfil", None),
            "fecha_registro": updated_user.get("fecha_registro"),
            "message": "Perfil actualizado exitosamente"
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error actualizando usuario: {str(e)}")

class ReporteCreateWithUser(BaseModel):
    descripcion: str
    foto_base64: str
    latitud: float
    longitud: float
    direccion: Optional[str] = None
    usuario_id: str

@app.post("/api/reportes")
def create_reporte(reporte: ReporteCreateWithUser):
    from bson import ObjectId
    
    # Create new report
    new_reporte = {
        "descripcion": reporte.descripcion,
        "foto_base64": reporte.foto_base64,
        "latitud": reporte.latitud,
        "longitud": reporte.longitud,
        "direccion": reporte.direccion,
        "usuario_id": reporte.usuario_id,
        "fecha": datetime.utcnow(),
        "estado": "activo",
        "publico": True
    }
    
    result = db.reportes.insert_one(new_reporte)
    
    # Award 20 points to user
    try:
        db.usuarios.update_one(
            {"_id": ObjectId(reporte.usuario_id)},
            {
                "$inc": {"puntos": 20, "reportes_enviados": 1}
            }
        )
    except Exception as e:
        print(f"Error updating user points: {e}")
    
    return {
        "message": "Reporte enviado exitosamente y publicado para la comunidad",
        "reporte_id": str(result.inserted_id),
        "puntos_ganados": 20
    }

@app.get("/api/reportes/{usuario_id}")
def get_user_reportes(usuario_id: str):
    reportes = list(db.reportes.find({"usuario_id": usuario_id}, {"_id": 0}))
    return {"reportes": reportes}

@app.get("/api/reportes-publicos")
def get_reportes_publicos():
    # Get all public reports with user info INCLUDING photos
    reportes = list(db.reportes.find(
        {"publico": True, "estado": "activo"}
        # Include foto_base64 so users can see the photos
    ))
    
    # Add user names to reports
    for reporte in reportes:
        if reporte.get("usuario_id"):
            from bson import ObjectId
            try:
                user = db.usuarios.find_one(
                    {"_id": ObjectId(reporte["usuario_id"])},
                    {"nombre": 1}
                )
                reporte["usuario_nombre"] = user.get("nombre", "Usuario Anónimo") if user else "Usuario Anónimo"
            except:
                reporte["usuario_nombre"] = "Usuario Anónimo"
        reporte["_id"] = str(reporte["_id"])
    
    return {"reportes": reportes}

@app.get("/api/mapa-reportes")
def get_mapa_reportes():
    # Get reports for map visualization
    reportes = list(db.reportes.find(
        {"publico": True, "estado": "activo"},
        {
            "latitud": 1, 
            "longitud": 1, 
            "descripcion": 1, 
            "fecha": 1,
            "direccion": 1,
            "usuario_id": 1
        }
    ))
    
    # Add user names for map markers
    for reporte in reportes:
        if reporte.get("usuario_id"):
            from bson import ObjectId
            try:
                user = db.usuarios.find_one(
                    {"_id": ObjectId(reporte["usuario_id"])},
                    {"nombre": 1}
                )
                reporte["usuario_nombre"] = user.get("nombre", "Usuario") if user else "Usuario"
            except:
                reporte["usuario_nombre"] = "Usuario"
        reporte["_id"] = str(reporte["_id"])
    
    return {"reportes": reportes}

@app.get("/api/incentivos")
def get_incentivos():
    incentivos = [
        {
            "id": "1",
            "nombre": "Descuento en Supermercado",
            "descripcion": "10% de descuento en productos orgánicos",
            "puntos_requeridos": 50,
            "categoria": "Descuentos"
        },
        {
            "id": "2", 
            "nombre": "Planta de Regalo",
            "descripcion": "Recibe una planta nativa del Perú",
            "puntos_requeridos": 100,
            "categoria": "Regalos"
        },
        {
            "id": "3",
            "nombre": "Kit de Reciclaje",
            "descripcion": "Set completo para reciclar en casa",
            "puntos_requeridos": 200,
            "categoria": "Productos"
        }
    ]
    return {"incentivos": incentivos}

@app.post("/api/canjear")
def canjear_incentivo(canje: CanjearIncentivo):
    return {
        "message": "Incentivo canjeado exitosamente",
        "fecha_canje": datetime.utcnow()
    }

@app.get("/api/noticias")
def get_noticias():
    noticias = [
        {
            "id": 1,
            "titulo": "Nuevo Horario de Recolección en Ventanilla",
            "contenido": "La Municipalidad de Ventanilla informa que el nuevo horario de recolección de residuos sólidos será de lunes a sábado de 6:00 AM a 2:00 PM en todas las zonas del distrito.",
            "fecha": "2024-01-15",
            "categoria": "Servicios"
        },
        {
            "id": 2,
            "titulo": "Programa de Reciclaje 'Ventanilla Verde'",
            "contenido": "Se ha inaugurado el programa municipal 'Ventanilla Verde' que permite el intercambio de materiales reciclables por puntos canjeables en el mercado local.",
            "fecha": "2024-01-12",
            "categoria": "Reciclaje"
        },
        {
            "id": 3,
            "titulo": "Campaña de Limpieza de Playas",
            "contenido": "Únete a la gran campaña de limpieza de las playas de Ventanilla este sábado 20 de enero. Punto de encuentro: Playa Costa Azul a las 8:00 AM.",
            "fecha": "2024-01-10",
            "categoria": "Medio Ambiente"
        }
    ]
    return {"noticias": noticias}

@app.get("/api/educacion")
def get_educacion_ambiental():
    contenido_educativo = [
        {
            "id": 1,
            "titulo": "¿Cómo Separar Residuos Correctamente?",
            "tipo": "video",
            "contenido": "Aprende la forma correcta de separar residuos orgánicos e inorgánicos según las normas peruanas.",
            "url": "https://example.com/video1",
            "duracion": "5 min",
            "categoria": "Básico"
        },
        {
            "id": 2,
            "titulo": "Horarios de Recolección en Ventanilla",
            "tipo": "informacion",
            "contenido": "Zona Norte: Lunes, Miércoles, Viernes (6:00 AM)\nZona Centro: Martes, Jueves, Sábado (7:00 AM)\nZona Sur: Lunes, Miércoles, Viernes (8:00 AM)",
            "categoria": "Servicios Locales"
        },
        {
            "id": 3,
            "titulo": "Beneficios del Compostaje Casero",
            "tipo": "articulo",
            "contenido": "El compostaje casero reduce hasta 30% los residuos domésticos y crea abono natural para plantas.",
            "categoria": "Avanzado"
        }
    ]
    return {"contenido": contenido_educativo}

@app.get("/api/ranking")
def get_ranking():
    # Simulate ranking data
    ranking = [
        {"posicion": 1, "nombre": "María González", "puntos": 450},
        {"posicion": 2, "nombre": "Carlos Ruiz", "puntos": 380},
        {"posicion": 3, "nombre": "Ana Torres", "puntos": 320},
        {"posicion": 4, "nombre": "Luis Mendoza", "puntos": 280},
        {"posicion": 5, "nombre": "Patricia López", "puntos": 250}
    ]
    return {"ranking": ranking}

@app.get("/api/notificaciones/{usuario_id}")
def get_notificaciones(usuario_id: str):
    notificaciones = [
        {
            "id": 1,
            "mensaje": "¡Felicitaciones! Has ganado 10 puntos por tu último reporte",
            "fecha": datetime.utcnow() - timedelta(hours=2),
            "leida": False
        },
        {
            "id": 2,
            "mensaje": "Nueva campaña de reciclaje disponible en tu zona",
            "fecha": datetime.utcnow() - timedelta(days=1),
            "leida": False
        }
    ]
    return {"notificaciones": notificaciones}

@app.delete("/api/notificaciones/{notif_id}")
def delete_notificacion(notif_id: str):
    return {"message": "Notificación eliminada"}

@app.get("/api/terminos")
def get_terminos():
    terminos = {
        "app_name": "VENTANILLA RECICLA CONTIGO",
        "version": "1.0.0",
        "propietarios": ["Dayan Gallegos", "Maria Ferrer"],
        "desarrollador": "Fernando Rufasto",
        "fecha_creacion": "2024",
        "descripcion": "Aplicación móvil para el cuidado del medio ambiente en Ventanilla, Lima, Perú. Una iniciativa ciudadana para promover la participación comunitaria en la protección ambiental.",
        "mision": "Empoderar a los ciudadanos de Ventanilla para que participen activamente en el cuidado y protección del medio ambiente de su comunidad.",
        "vision": "Convertir a Ventanilla en un distrito modelo de sostenibilidad ambiental a través de la tecnología y participación ciudadana.",
        "terminos": [
            "TÉRMINOS DE USO Y CONDICIONES GENERALES",
            "",
            "1. ACEPTACIÓN DE TÉRMINOS",
            "Al descargar, instalar o usar esta aplicación, aceptas cumplir con estos términos y condiciones.",
            "",
            "2. USO DE LA APLICACIÓN", 
            "• La aplicación es de uso gratuito para todos los ciudadanos de Ventanilla",
            "• Está destinada exclusivamente para reportar problemas ambientales reales",
            "• Los usuarios se comprometen a usar la app de manera responsable y veraz",
            "",
            "3. REPORTES Y CONTENIDO",
            "• Los reportes enviados serán públicos para toda la comunidad",
            "• Las fotos deben mostrar problemas ambientales reales (basura, contaminación, etc.)",
            "• Está prohibido subir contenido ofensivo, falso o que no corresponda a temas ambientales",
            "• La aplicación se reserva el derecho de moderar y eliminar contenido inapropiado",
            "",
            "4. SISTEMA DE PUNTOS E INCENTIVOS",
            "• Los puntos se otorgan por reportes válidos y verificados (20 puntos por reporte)",
            "• Los incentivos están sujetos a disponibilidad y pueden cambiar sin previo aviso",
            "• Los puntos no tienen valor monetario y son solo para el sistema de gamificación",
            "",
            "5. PRIVACIDAD Y DATOS",
            "• La información de ubicación se usa únicamente para geolocalizar reportes ambientales",
            "• Los datos personales se mantienen seguros y no se comparten con terceros",
            "• Las fotos pueden ser utilizadas para promover el cuidado ambiental en redes sociales oficiales",
            "",
            "6. RESPONSABILIDADES",
            "• Los usuarios son responsables de la veracidad de sus reportes",
            "• La aplicación no se hace responsable por daños derivados del uso incorrecto",
            "• Es responsabilidad del usuario mantener actualizados sus datos de contacto",
            "",
            "7. MODIFICACIONES",
            "• Estos términos pueden modificarse en cualquier momento",
            "• Los usuarios serán notificados de cambios importantes",
            "• El uso continuado implica aceptación de las modificaciones"
        ],
        "contacto": {
            "municipalidad": "Municipalidad de Ventanilla",
            "email_soporte": "reciclacontigo@ventanilla.gob.pe",
            "telefono": "+51 1 234-5678",
            "direccion": "Av. Néstor Gambetta, Ventanilla, Callao, Perú"
        },
        "politica_privacidad": "Tu privacidad es fundamental para nosotros. Solo recopilamos la información estrictamente necesaria para el funcionamiento de la aplicación: nombre, email, ubicación de reportes y fotos de problemas ambientales. Esta información se usa únicamente para mejorar las condiciones ambientales de Ventanilla y nunca se comparte con terceros sin tu consentimiento.",
        "licencia": "Esta aplicación es propiedad intelectual de Dayan Gallegos y Maria Ferrer. Desarrollada por Fernando Rufasto.",
        "derechos": "© 2024 Dayan Gallegos & Maria Ferrer. Todos los derechos reservados.",
        "agradecimientos": "Agradecemos a la comunidad de Ventanilla por su participación activa en el cuidado del medio ambiente y a la Municipalidad de Ventanilla por su apoyo a esta iniciativa ciudadana."
    }
    return terminos

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
