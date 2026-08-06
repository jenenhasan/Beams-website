from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class MenuItem(BaseModel):
    id: str
    name: str
    desc: str
    price: str
    favorite: bool = False
    image: Optional[str] = None

class Category(BaseModel):
    id: str
    numeral: str
    title: str
    subtitle: str
    items: List[MenuItem]

class MenuData(BaseModel):
    categories: List[Category]

class MenuResponse(BaseModel):
    data: MenuData
    updated_at: Optional[str] = None