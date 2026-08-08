from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
   
    DATABASE_URL: str = "" 
    
    
    SECRET_KEY: str = ""  
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
   
    ADMIN_USERNAME: str = "" 
    ADMIN_PASSWORD: str = "" 
    
  
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://beams-caffe.vercel.app", 
        "https://beams-caffe-git-main.vercel.app",  ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  


settings = Settings()