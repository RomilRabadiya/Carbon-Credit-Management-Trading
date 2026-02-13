from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import time

# Attempt to import Earth Engine, but allow fallback if not configured
try:
    import ee
    import geemap
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False
    print("Warning: Earth Engine libraries not installed. Running in simulation mode.")

app = FastAPI(title="CarbonLedger Geo-Service")

# Initialize EE if available
if EE_AVAILABLE:
    try:
        ee.Initialize()
    except Exception as e:
        print(f"Warning: Failed to initialize Earth Engine: {e}")
        print("Running in simulation mode.")
        EE_AVAILABLE = False

class AnalysisRequest(BaseModel):
    lat: float
    lon: float
    buffer_m: int = 5000
    projectId: str

class AnalysisResult(BaseModel):
    projectId: str
    lat: float
    lon: float
    nonGreenPercentage: float
    status: str
    details: str

def detect_non_green_areas(lat, lon, buffer_m=5000):
    """
    Real Earth Engine Logic provided by the user.
    """
    if not EE_AVAILABLE:
        # Simulation Mode
        time.sleep(1.5) # Simulate processing time
        
        # Make it deterministic based on location
        # If we check the same spot, we should get the same result!
        random.seed(lat + lon)
        
        # Return a "realistic" value for demo
        val = random.uniform(0.1, 0.4) 
        return val

    try:
        # 1. Define the area of interest
        poi = ee.Geometry.Point([lon, lat]).buffer(buffer_m)

        # 2. Load Sentinel-2 Satellite imagery
        image = (ee.ImageCollection('COPERNICUS/S2_SR')
                 .filterBounds(poi)
                 .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
                 .sort('system:time_start', False)
                 .first())

        # 3. Calculate NDVI
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')

        # 4. Mask for "Non-Green" areas (NDVI < 0.2)
        non_green_mask = ndvi.lt(0.2)
        
        # 5. Calculate percentage
        stats = non_green_mask.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=poi,
            scale=10
        )
        
        return stats.get('NDVI').getInfo()
    except Exception as e:
        print(f"Error during EE analysis: {e}")
        # Fallback to simulation on error
        return random.uniform(0.15, 0.35)

def check_restricted_land(lat, lon):
    """
    Simulates checking against the World Database on Protected Areas (WDPA).
    In a real app, this would query a PostGIS database or WDPA API.
    """
    # DEMO LOGIC:
    # If lat or lon is a whole integer (e.g. 25.0), we consider it "Government Land"
    # This allows us to easily force a failure in our demo.
    if lat.is_integer() or lon.is_integer():
        return {
            "is_restricted": True,
            "designation": "National Park (Protected)",
            "owner": "Government of India"
        }
    
    return {
        "is_restricted": False,
        "designation": "Agricultural / Private",
        "owner": "Private Entity"
    }

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_land(request: AnalysisRequest):
    print(f"Received analysis request for Project {request.projectId} at {request.lat}, {request.lon}")
    
    # 1. Satellite Analysis (Green Cover)
    score = detect_non_green_areas(request.lat, request.lon, request.buffer_m)
    
    # 2. Land Registry Check (New)
    land_data = check_restricted_land(request.lat, request.lon)
    
    # Interpretation logic
    status = "VERIFIED"
    details = "Vegetation cover meets credits criteria."
    
    if land_data["is_restricted"]:
        status = "FRAUD_RISK"
        details = f"CRITICAL: Coordinates fall within {land_data['designation']}. Ownership mismatch."
    elif score > 0.5:
        status = "HIGH_RISK"
        details = "High density of non-green area detected. Potential deforestation."
    elif score > 0.3:
        status = "WARNING"
        details = "Moderate non-green area. Manual review recommended."
        
    return AnalysisResult(
        projectId=request.projectId,
        lat=request.lat,
        lon=request.lon,
        nonGreenPercentage=score,
        status=status,
        details=details
    )

@app.get("/health")
def health_check():
    return {"status": "up", "ee_connected": EE_AVAILABLE}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
