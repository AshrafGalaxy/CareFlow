import json
import random

# Coordinates for states and their major cities
STATES_DATA = {
    "Maharashtra": {
        "center": [19.0760, 72.8777],
        "zoom": 6,
        "cities": [
            {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777},
            {"name": "Pune", "lat": 18.5204, "lng": 73.8567},
            {"name": "Nagpur", "lat": 21.1458, "lng": 79.0882},
            {"name": "Nashik", "lat": 20.0110, "lng": 73.7903},
            {"name": "Aurangabad", "lat": 19.8762, "lng": 75.3433}
        ]
    },
    "Karnataka": {
        "center": [12.9716, 77.5946],
        "zoom": 6,
        "cities": [
            {"name": "Bangalore", "lat": 12.9716, "lng": 77.5946},
            {"name": "Mysore", "lat": 12.2958, "lng": 76.6394},
            {"name": "Hubli", "lat": 15.3647, "lng": 75.1240},
            {"name": "Mangalore", "lat": 12.9141, "lng": 74.8560},
            {"name": "Belgaum", "lat": 15.8497, "lng": 74.4977}
        ]
    },
    "Tamil Nadu": {
        "center": [13.0827, 80.2707],
        "zoom": 6,
        "cities": [
            {"name": "Chennai", "lat": 13.0827, "lng": 80.2707},
            {"name": "Coimbatore", "lat": 11.0168, "lng": 76.9558},
            {"name": "Madurai", "lat": 9.9252, "lng": 78.1198},
            {"name": "Tiruchirappalli", "lat": 10.7905, "lng": 78.7047},
            {"name": "Salem", "lat": 11.6643, "lng": 78.1460}
        ]
    },
    "Delhi": {
        "center": [28.6139, 77.2090],
        "zoom": 10,
        "cities": [
            {"name": "New Delhi", "lat": 28.6139, "lng": 77.2090},
            {"name": "Gurugram", "lat": 28.4595, "lng": 77.0266},
            {"name": "Noida", "lat": 28.5355, "lng": 77.3910},
            {"name": "Faridabad", "lat": 28.4089, "lng": 77.3178}
        ]
    },
    "Rajasthan": {
        "center": [26.9124, 75.7873],
        "zoom": 6,
        "cities": [
            {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873},
            {"name": "Jodhpur", "lat": 26.2389, "lng": 73.0243},
            {"name": "Udaipur", "lat": 24.5854, "lng": 73.7125},
            {"name": "Kota", "lat": 25.2138, "lng": 75.8648},
            {"name": "Ajmer", "lat": 26.4499, "lng": 74.6399}
        ]
    },
    "West Bengal": {
        "center": [22.5726, 88.3639],
        "zoom": 6,
        "cities": [
            {"name": "Kolkata", "lat": 22.5726, "lng": 88.3639},
            {"name": "Howrah", "lat": 22.5958, "lng": 88.3110},
            {"name": "Asansol", "lat": 23.6739, "lng": 86.9524},
            {"name": "Siliguri", "lat": 26.7271, "lng": 88.3953},
            {"name": "Durgapur", "lat": 23.5204, "lng": 87.3119}
        ]
    },
    "Telangana": {
        "center": [17.3850, 78.4867],
        "zoom": 7,
        "cities": [
            {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867},
            {"name": "Warangal", "lat": 17.9689, "lng": 79.5941},
            {"name": "Nizamabad", "lat": 18.6725, "lng": 78.0941},
            {"name": "Karimnagar", "lat": 18.4386, "lng": 79.1288},
            {"name": "Ramagundam", "lat": 18.7610, "lng": 79.4867}
        ]
    }
}

HOSPITAL_TEMPLATES = [
    ("Apollo Hospitals", "Private / Network"),
    ("Fortis Hospital", "Private / Network"),
    ("Max Super Speciality Hospital", "Private / Network"),
    ("Care Hospital", "Private / Network"),
    ("Manipal Hospital", "Private / Network"),
    ("Narayana Multispeciality", "Private / Network"),
    ("Government Medical College", "Public / PM-JAY"),
    ("Civil Hospital", "Public / PM-JAY"),
    ("District General Hospital", "Public / PM-JAY"),
    ("Yashoda Hospitals", "Private / Network"),
    ("Medanta - The Medicity", "Private / Network"),
    ("AIIMS", "Public / PM-JAY")
]

STREETS = ["MG Road", "Station Road", "Ring Road", "Main Street", "Link Road", "City Center", "Gandhi Marg"]

hospitals_ts_content = f"""export interface HospitalData {{
  id: string
  name: string
  address?: string
  distance?: string
  type: string
  lat: number
  lng: number
  phone?: string
}}

export const STATE_HOSPITALS: Record<string, {{ center: [number, number], zoom: number, hospitals: HospitalData[] }}> = {{
"""

h_id = 1
for state, data in STATES_DATA.items():
    hospitals_ts_content += f'  "{state}": {{\n'
    hospitals_ts_content += f'    center: [{data["center"][0]}, {data["center"][1]}],\n'
    hospitals_ts_content += f'    zoom: {data["zoom"]},\n'
    hospitals_ts_content += f'    hospitals: [\n'
    
    hospitals_list = []
    for city in data["cities"]:
        for i in range(10): # 10 hospitals per city
            name_t, type_t = random.choice(HOSPITAL_TEMPLATES)
            name = f"{name_t}, {city['name']}"
            if name_t == "AIIMS":
                name = f"AIIMS {city['name']}"
            
            # Offset lat/lng by a small amount to scatter them around the city
            lat_offset = random.uniform(-0.05, 0.05)
            lng_offset = random.uniform(-0.05, 0.05)
            
            lat = city['lat'] + lat_offset
            lng = city['lng'] + lng_offset
            
            phone = f"+91-{random.randint(11, 99)}-{random.randint(20000000, 99999999)}"
            address = f"{random.randint(1, 500)}, {random.choice(STREETS)}, Near {city['name']} Central, {city['name']}, {state} {random.randint(100000, 999999)}"
            
            hospitals_list.append(f"""      {{ id: "h{h_id}", name: "{name}", address: "{address}", type: "{type_t}", lat: {lat:.5f}, lng: {lng:.5f}, phone: "{phone}" }}""")
            h_id += 1
            
    hospitals_ts_content += ",\n".join(hospitals_list)
    hospitals_ts_content += f'\n    ]\n  }},\n'

hospitals_ts_content += "}\n"

with open("C:/Users/Ashraf/Desktop/CareFlow/frontend/src/data/hospitals.ts", "w", encoding="utf-8") as f:
    f.write(hospitals_ts_content)

print("Generated hospitals.ts successfully!")
