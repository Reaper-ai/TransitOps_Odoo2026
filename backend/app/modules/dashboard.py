# backend/app/modules/dashboard.py
from fastapi import APIRouter, Depends

from app.db.session import db
from app.core.dependencies import get_current_user
from app.modules.schemas import DashboardKPIs, VehicleAnalytics

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard Analytics"])


@router.get("/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(current_user: dict = Depends(get_current_user)):
    vehicles = db.get_all_vehicles()
    drivers = db.get_all_drivers()
    trips = db.get_all_trips()
    maintenance_logs = db.get_all_maintenance_logs()

    active_vehicles = sum(1 for v in vehicles if v["status"] == "On Trip")
    available_vehicles = sum(1 for v in vehicles if v["status"] == "Available")
    in_shop_vehicles = sum(1 for v in vehicles if v["status"] == "In Shop")
    retired_vehicles = sum(1 for v in vehicles if v["status"] == "Retired")

    active_trips = sum(1 for t in trips if t["status"] == "Dispatched")
    pending_trips = sum(1 for t in trips if t["status"] == "Draft")
    completed_trips = sum(1 for t in trips if t["status"] == "Completed")

    drivers_on_duty = sum(1 for d in drivers if d["status"] == "On Trip")
    available_drivers = sum(1 for d in drivers if d["status"] == "Available")

    non_retired = len(vehicles) - retired_vehicles
    fleet_utilization = (active_vehicles / non_retired * 100.0) if non_retired > 0 else 0.0

    vehicle_analytics: list[VehicleAnalytics] = []
    total_fuel_liters = 0.0
    total_distance = 0.0
    total_operational_cost = 0.0
    total_revenue = 0.0

    for vehicle in vehicles:
        reg = vehicle["registration_number"]
        vehicle_trips = [t for t in trips if t["vehicle_reg"] == reg]
        revenue = sum(float(t.get("revenue") or 0) for t in vehicle_trips)
        distance = sum(float(t.get("planned_distance") or 0) for t in vehicle_trips)

        fuel_cost = 0.0
        fuel_liters = 0.0
        for trip in vehicle_trips:
            for expense in db.get_expenses_by_trip(trip["id"]):
                if expense["type"] == "Fuel":
                    fuel_cost += float(expense.get("cost") or 0)
                    fuel_liters += float(expense.get("liters") or 0)

        maintenance_cost = sum(
            float(m.get("cost") or 0)
            for m in maintenance_logs
            if m["vehicle_reg"] == reg
        )

        operational_cost = fuel_cost + maintenance_cost
        acquisition = float(vehicle.get("acquisition_cost") or 0)
        roi = ((revenue - operational_cost) / acquisition) if acquisition > 0 else None
        fuel_efficiency = (distance / fuel_liters) if fuel_liters > 0 else None

        total_fuel_liters += fuel_liters
        total_distance += distance
        total_operational_cost += operational_cost
        total_revenue += revenue

        vehicle_analytics.append(
            VehicleAnalytics(
                registration_number=reg,
                model=vehicle["model"],
                type=vehicle["type"],
                status=vehicle["status"],
                acquisition_cost=acquisition,
                revenue=revenue,
                fuel_cost=fuel_cost,
                maintenance_cost=maintenance_cost,
                operational_cost=operational_cost,
                fuel_liters=fuel_liters,
                distance=distance,
                fuel_efficiency=fuel_efficiency,
                roi=roi,
            )
        )

    overall_fuel_efficiency = (
        (total_distance / total_fuel_liters) if total_fuel_liters > 0 else None
    )

    return DashboardKPIs(
        active_vehicles=active_vehicles,
        available_vehicles=available_vehicles,
        in_shop_vehicles=in_shop_vehicles,
        retired_vehicles=retired_vehicles,
        active_trips=active_trips,
        pending_trips=pending_trips,
        completed_trips=completed_trips,
        drivers_on_duty=drivers_on_duty,
        available_drivers=available_drivers,
        fleet_utilization=round(fleet_utilization, 2),
        overall_fuel_efficiency=overall_fuel_efficiency,
        total_operational_cost=total_operational_cost,
        total_revenue=total_revenue,
        vehicles=vehicle_analytics,
    )
