import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationMap from "./NavigationMap";
import EmergencyFacilities from "./EmergencyFacilities";
import DispatchComms from "./DispatchComms";
import { apiRequest } from "../../config/api";
import { createAppSocket } from "../../config/socket";

function AmbulanceDashboard() {
  const navigate = useNavigate();
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    [],
  );
  const ambulanceId = useMemo(() => {
    const fromUser = storedUser?.ambulanceId || storedUser?.ambulance?.id || storedUser?.id;
    if (typeof fromUser === "string" && fromUser.trim().toUpperCase().startsWith("AMB-")) {
      return fromUser.trim().toUpperCase();
    }
    return "AMB-04";
  }, [storedUser]);

  const [ambulance, setAmbulance] = useState({
    id: ambulanceId,
    status: "Active Duty",
    currentSpeed: 0,
    lat: -0.2827,
    lng: 36.08,
  });
  const [activeIncident, setActiveIncident] = useState(null);
  const [patientCareId, setPatientCareId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [patientData, setPatientData] = useState({
    patientName: "",
    age: "",
    gender: "",
    medicalCondition: "",
    severity: "",
    estimatedTime: "",
    paramedicReport: "",
    vitals: {
      heartRate: "",
      bloodPressure: "",
      oxygenLevel: "",
      temperature: "",
      respiratoryRate: "",
    },
  });

  const [facilities, setFacilities] = useState([]);
  const [trafficConditions, setTrafficConditions] = useState([
    { type: "congestion", location: "Nakuru CBD Roundabout", status: "red" },
    { type: "clear", location: "Kenyatta Avenue is clear", status: "green" },
  ]);
  const [dispatchMessages, setDispatchMessages] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showPatientCare, setShowPatientCare] = useState(false);
  const [showLiveVitals, setShowLiveVitals] = useState(false);
  const [incident] = useState({
    lat: -0.29,
    lng: 36.07,
  });

  const [hospital] = useState({
    name: "Assigned Hospital",
    lat: -0.3031,
    lng: 36.08,
  });

  const facilitySelected = Boolean(selectedFacility?.id);

  const validateVitals = () => {
    const errors = [];
    const { heartRate, bloodPressure, oxygenLevel, temperature, respiratoryRate } =
      patientData.vitals;

    if (bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure.trim())) {
      errors.push("Blood pressure must be in the format 120/80.");
    }

    const parsedHeartRate = Number(heartRate);
    if (heartRate !== "" && (Number.isNaN(parsedHeartRate) || parsedHeartRate < 0)) {
      errors.push("Heart rate must be 0 or higher.");
    }

    const parsedOxygen = Number(oxygenLevel);
    if (
      oxygenLevel !== "" &&
      (Number.isNaN(parsedOxygen) || parsedOxygen < 0 || parsedOxygen > 100)
    ) {
      errors.push("Oxygen level must be between 0 and 100.");
    }

    const parsedTemp = Number(temperature);
    if (temperature !== "" && (Number.isNaN(parsedTemp) || parsedTemp < 0)) {
      errors.push("Temperature must be 0 or higher.");
    }

    const parsedResp = Number(respiratoryRate);
    if (respiratoryRate !== "" && (Number.isNaN(parsedResp) || parsedResp < 0)) {
      errors.push("Respiratory rate must be 0 or higher.");
    }

    return errors.join(" ");
  };

  const navigation = {
    nextManeuver: "Proceed to destination",
    distance: "Live",
    destinationName: hospital.name,
    timeToDestination: patientData.estimatedTime || "--",
    distanceToDestination: "Select a hospital",
  };

  const requiredBeds =
    patientData.severity === "Critical" || patientData.severity === "Severe" ? 2 : 1;

  const mapFacility = useCallback(
    (facility, fallbackDistanceKm = 0) => ({
      id: facility.id,
      name: facility.name,
      level: facility.type || "Hospital",
      hospitalUserId: facility.hospitalUserId || null,
      lat: Number(facility.latitude || facility.lat || 0),
      lng: Number(facility.longitude || facility.lng || 0),
      distanceKm: Number(facility.distanceKm ?? fallbackDistanceKm ?? 0),
      bedsAvailable: Number(facility.bedsAvailable || 0),
      wait: `${Math.max(5, Math.round((facility.distanceKm || fallbackDistanceKm || 1) * 4))}m`,
      canAccept:
        Number(facility.bedsAvailable || 0) >= requiredBeds &&
        Number(facility.bedsAvailable || 0) > 0,
      status:
        Number(facility.bedsAvailable || 0) >= requiredBeds &&
        Number(facility.bedsAvailable || 0) > 0
          ? "available"
          : "busy",
    }),
    [requiredBeds],
  );

  const loadFacilities = useCallback(async () => {
    const toRadians = (value) => (value * Math.PI) / 180;
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    try {
      const nearby = await apiRequest(
        `/api/facilities/nearby?lat=${ambulance.lat}&lng=${ambulance.lng}&radius=50`,
      );
      let mapped = (nearby || []).map((facility) => mapFacility(facility));

      if (mapped.length < 6) {
        const available = await apiRequest("/api/facilities/available");
        const mergedById = new Map(mapped.map((facility) => [facility.id, facility]));
        (available || []).forEach((facility) => {
          const lat = Number(facility.latitude || 0);
          const lng = Number(facility.longitude || 0);
          const distanceKm = haversineKm(ambulance.lat, ambulance.lng, lat, lng);
          if (!mergedById.has(facility.id)) {
            mergedById.set(facility.id, mapFacility(facility, distanceKm));
          }
        });
        mapped = Array.from(mergedById.values()).sort((a, b) => a.distanceKm - b.distanceKm);
      }

      setFacilities(mapped);
      setTrafficConditions((prev) => {
        const updated = [...prev];
        if (mapped.length > 0) {
          updated[1] = {
            type: "clear",
            location: `Nearest facility: ${mapped[0].name}`,
            status: "green",
          };
        }
        return updated;
      });
    } catch {
      setFacilities([]);
    }
  }, [ambulance.lat, ambulance.lng, mapFacility]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [status, messages, incidentData] = await Promise.all([
          apiRequest(`/api/ambulance/${ambulanceId}/status`).catch(() => null),
          apiRequest(`/api/dispatch/messages/${ambulanceId}`).catch(() => []),
          apiRequest(`/api/ambulance/${ambulanceId}/active-incident`).catch(
            () => null,
          ),
        ]);

        if (status) {
          setAmbulance((prev) => ({
            ...prev,
            status: status.status || prev.status,
            lat: Number(status.latitude || prev.lat),
            lng: Number(status.longitude || prev.lng),
            currentSpeed: Number(status.speed || 0),
          }));
        }

        setDispatchMessages(
          (messages || []).map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp || Date.now()),
          })),
        );

        setActiveIncident(incidentData);
        if (incidentData?.id) {
          setPatientCareId(incidentData.id);
        }
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    loadDashboardData();
  }, [ambulanceId]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = createAppSocket(token);
    if (!socket) return undefined;

    const onNotification = (notification) => {
      if (!notification) return;

      if (notification.type === "dispatch") {
        const payload = notification.payload || {};
        setDispatchMessages((prev) => [
          {
            ...payload,
            sender: payload.sender || "Dispatch",
            code: payload.code || "AMB-IN",
            message: payload.message || notification.message || "New dispatch update",
            timestamp: new Date(payload.timestamp || notification.timestamp || Date.now()),
          },
          ...prev,
        ]);
        return;
      }

      if (notification.type === "arrival-notice") {
        setTrafficConditions((prev) => [
          {
            type: "clear",
            location: notification.message || "Hospital arrival notice received",
            status: "green",
          },
          ...prev.slice(0, 1),
        ]);
      }
    };

    socket.on("ambulance-notification", onNotification);
    socket.on("connect_error", (err) => {
      setError(err?.message || "Real-time connection failed");
    });

    return () => {
      socket.off("ambulance-notification", onNotification);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    apiRequest(`/api/ambulance/${ambulanceId}/location`, {
      method: "PUT",
      body: JSON.stringify({
        latitude: ambulance.lat,
        longitude: ambulance.lng,
        speed: ambulance.currentSpeed,
        status: ambulance.status,
      }),
    }).catch(() => null);
  }, [ambulanceId, ambulance.lat, ambulance.lng, ambulance.currentSpeed, ambulance.status]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handlePatientDataChange = (field, value) => {
    setPatientData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalsChange = (field, value) => {
    setPatientData((prev) => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value },
    }));
  };

  const handleSubmitPatientCare = async () => {
    if (!selectedFacility?.id) {
      setError("Select an emergency facility first so patient details can be sent to hospital.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const incidentId =
        activeIncident?.incidentId || `INC-${ambulanceId}-${Date.now()}`;
      const payload = {
        ambulanceId,
        incidentId,
        patientName: patientData.patientName,
        age: patientData.age ? Number(patientData.age) : null,
        gender: patientData.gender || null,
        medicalCondition: patientData.medicalCondition,
        severity: patientData.severity,
        estimatedTime: patientData.estimatedTime,
        paramedicReport: patientData.paramedicReport,
        facilityId: selectedFacility.id,
        hospitalUserId: selectedFacility.hospitalUserId || null,
      };

      const record = await apiRequest("/api/patient-care", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setActiveIncident(record);
      setPatientCareId(record.id);
      setShowPatientCare(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVitals = async () => {
    if (!selectedFacility?.id) {
      setError("Select an emergency facility first so live vitals can be sent to hospital.");
      return;
    }

    const vitalsError = validateVitals();
    if (vitalsError) {
      setError(vitalsError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const incidentId =
        activeIncident?.incidentId || `INC-${ambulanceId}-${Date.now()}`;
      const payload = {
        patientCareId: patientCareId || undefined,
        incidentId,
        ambulanceId,
        heartRate: patientData.vitals.heartRate
          ? Number(patientData.vitals.heartRate)
          : null,
        bloodPressure: patientData.vitals.bloodPressure || null,
        oxygenLevel: patientData.vitals.oxygenLevel
          ? Number(patientData.vitals.oxygenLevel)
          : null,
        temperature: patientData.vitals.temperature
          ? Number(patientData.vitals.temperature)
          : null,
        respiratoryRate: patientData.vitals.respiratoryRate
          ? Number(patientData.vitals.respiratoryRate)
          : null,
        facilityId: selectedFacility.id,
        hospitalUserId: selectedFacility.hospitalUserId || null,
      };
      console.log("Vitals payload:", payload);

      await apiRequest("/api/vitals", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setShowLiveVitals(false);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendDispatch = async (text) => {
    try {
      const msg = await apiRequest("/api/dispatch/message", {
        method: "POST",
        body: JSON.stringify({
          ambulanceId,
          sender: "Ambulance Crew",
          senderRole: "system",
          code: "AMB-OUT",
          message: text,
          priority: "normal",
          messageType: "info",
        }),
      });

      setDispatchMessages((prev) => [
        { ...msg, timestamp: new Date(msg.timestamp || Date.now()) },
        ...prev,
      ]);
    } catch (sendError) {
      setError(sendError.message);
    }
  };

  const handleSelectFacility = async (facility) => {
    setSelectedFacility(facility);
    setError("");

    try {
      await apiRequest(`/api/facilities/${facility.id}/notify-arrival`, {
        method: "PUT",
        body: JSON.stringify({
          ambulanceId,
          hospitalUserId: facility.hospitalUserId || null,
          eta: patientData.estimatedTime || "Unknown",
          patientName: patientData.patientName || "Unknown Patient",
          age: patientData.age ? Number(patientData.age) : null,
          gender: patientData.gender || null,
          medicalCondition: patientData.medicalCondition || "Emergency case",
          severity: patientData.severity || "moderate",
          distanceKm: facility.distanceKm,
          notes: patientData.paramedicReport || "",
        }),
      });
    } catch (notifyError) {
      setError(
        `${facility.name} selected locally, but hospital notify failed: ${notifyError.message}`,
      );
    }
  };

  const handleViewAllFacilitiesMap = () => {
    navigate("/ambulance/facilities", {
      state: {
        facilities,
        selectedFacility,
        ambulance: {
          id: ambulance.id,
          lat: ambulance.lat,
          lng: ambulance.lng,
        },
      },
    });
  };

  const handleRadioDispatch = async () => {
    await handleSendDispatch(
      `Radio dispatch check from ${ambulanceId}. Current status: ${ambulance.status}.`,
    );
  };

  const distanceToDestination = useMemo(() => {
    if (!selectedFacility) return "Select a hospital";
    const toRadians = (value) => (value * Math.PI) / 180;
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
          Math.cos(toRadians(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    const km = haversineKm(ambulance.lat, ambulance.lng, hospital.lat, hospital.lng);
    return `${km.toFixed(1)} km`;
  }, [ambulance.lat, ambulance.lng, hospital.lat, hospital.lng, selectedFacility]);

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <header className="w-full bg-[#0a1628] flex justify-between items-center px-8 py-4 shadow-xl border-b border-blue-900/50 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">UzimaNode</h1>
            <p className="text-xs text-blue-300 tracking-widest">AMBULANCE CREW DASHBOARD</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-sm text-white">
            Unit: <span className="text-red-400 font-semibold">{ambulance.id}</span>
            {" "} | Status: <span className="text-green-400 font-semibold">{ambulance.status}</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-lg bg-red-600 border border-red-500 text-white font-semibold shadow-md hover:bg-red-700 transition-all text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[3fr_1fr] gap-6 p-6 flex-1 relative z-0">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-gray-300 overflow-hidden shadow-lg flex-1 flex flex-col bg-white">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50">
              <h3 className="text-base font-semibold text-gray-800">Driver Navigation System</h3>
            </div>

            <NavigationMap
              ambulance={ambulance}
              incident={incident}
              hospital={hospital}
              navigation={{ ...navigation, distanceToDestination }}
              currentSpeed={ambulance.currentSpeed}
            />

            <div className="px-6 py-4 border-t border-gray-300 bg-gray-50">
              <h4 className="text-xs text-gray-600 mb-3 tracking-wider font-semibold">
                LIVE TRAFFIC FEED
              </h4>
              <div className="flex flex-col gap-3">
                {trafficConditions.map((condition, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 bg-white rounded-lg text-sm border-l-4 ${
                      condition.status === "red" ? "border-red-500" : "border-green-500"
                    }`}
                  >
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        condition.status === "red" ? "bg-red-500" : "bg-green-500"
                      }`}
                    />
                    <span className="text-gray-700">
                      {condition.type === "congestion"
                        ? `Congestion at ${condition.location}`
                        : condition.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 overflow-hidden shadow-lg bg-white p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Patient Information</h3>
              <p className="text-sm text-gray-500">
                Access patient care details and live vitals
              </p>
              {selectedFacility && (
                <p className="text-sm text-green-700 mt-2 font-semibold">
                  Selected Facility: {selectedFacility.name} ({selectedFacility.level})
                </p>
              )}
            </div>
            {!facilitySelected && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Select an emergency facility to enable patient care and live vitals.
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowPatientCare(true)}
                disabled={!facilitySelected}
                className="px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Patient Care
              </button>
              <button
                onClick={() => setShowLiveVitals(true)}
                disabled={!facilitySelected}
                className="px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Live Vitals
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <EmergencyFacilities
            facilities={facilities}
            requiredBeds={requiredBeds}
            selectedFacilityId={selectedFacility?.id}
            onSelectFacility={handleSelectFacility}
            onViewAllMap={handleViewAllFacilitiesMap}
            onRefreshFacilities={loadFacilities}
          />
          <DispatchComms
            messages={dispatchMessages}
            onSendMessage={handleSendDispatch}
            onRadioDispatch={handleRadioDispatch}
          />
        </div>
      </div>

      {showPatientCare && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div className="absolute inset-0 bg-black opacity-70" onClick={() => setShowPatientCare(false)} />
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-800">Patient Care Form</h3>
              <button onClick={() => setShowPatientCare(false)} className="text-gray-500 text-2xl">x</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {error && (
                <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              {selectedFacility && (
                <div className="col-span-2 rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
                  Facility selected: {selectedFacility.name}
                </div>
              )}
              <input className="border rounded p-3" placeholder="Patient Name*" value={patientData.patientName} onChange={(e) => handlePatientDataChange("patientName", e.target.value)} />
              <input className="border rounded p-3" placeholder="Medical Condition*" value={patientData.medicalCondition} onChange={(e) => handlePatientDataChange("medicalCondition", e.target.value)} />
              <select className="border rounded p-3" value={patientData.severity} onChange={(e) => handlePatientDataChange("severity", e.target.value)}>
                <option value="">Severity*</option>
                <option value="Critical">Critical</option>
                <option value="Severe">Severe</option>
                <option value="Moderate">Moderate</option>
                <option value="Mild">Mild</option>
              </select>
              <input className="border rounded p-3" placeholder="ETA" value={patientData.estimatedTime} onChange={(e) => handlePatientDataChange("estimatedTime", e.target.value)} />
              <input className="border rounded p-3" placeholder="Age" type="number" value={patientData.age} onChange={(e) => handlePatientDataChange("age", e.target.value)} />
              <select className="border rounded p-3" value={patientData.gender} onChange={(e) => handlePatientDataChange("gender", e.target.value)}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <textarea className="border rounded p-3 col-span-2" rows="4" placeholder="Paramedic report*" value={patientData.paramedicReport} onChange={(e) => handlePatientDataChange("paramedicReport", e.target.value)} />
              <button onClick={() => setShowPatientCare(false)} className="bg-gray-500 text-white rounded p-3">Cancel</button>
              <button disabled={loading} onClick={handleSubmitPatientCare} className="bg-blue-600 text-white rounded p-3 disabled:opacity-60">
                {loading ? "Saving..." : "Save Patient Information"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLiveVitals && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
          <div className="absolute inset-0 bg-black opacity-70" onClick={() => setShowLiveVitals(false)} />
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <div className="px-6 py-4 border-b border-gray-300 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-800">Record Vital Signs</h3>
              <button onClick={() => setShowLiveVitals(false)} className="text-gray-500 text-2xl">x</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {error && (
                <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              {selectedFacility && (
                <div className="col-span-2 rounded-lg border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
                  Facility selected: {selectedFacility.name}
                </div>
              )}
              <input className="border rounded p-3" type="number" placeholder="Heart Rate" value={patientData.vitals.heartRate} onChange={(e) => handleVitalsChange("heartRate", e.target.value)} />
              <input className="border rounded p-3" placeholder="Blood Pressure (120/80)" value={patientData.vitals.bloodPressure} onChange={(e) => handleVitalsChange("bloodPressure", e.target.value)} />
              <input className="border rounded p-3" type="number" min="0" max="100" placeholder="Oxygen Level" value={patientData.vitals.oxygenLevel} onChange={(e) => handleVitalsChange("oxygenLevel", e.target.value)} />
              <input className="border rounded p-3" type="number" min="0" step="0.1" placeholder="Temperature" value={patientData.vitals.temperature} onChange={(e) => handleVitalsChange("temperature", e.target.value)} />
              <input className="border rounded p-3 col-span-2" type="number" min="0" placeholder="Respiratory Rate" value={patientData.vitals.respiratoryRate} onChange={(e) => handleVitalsChange("respiratoryRate", e.target.value)} />
              <button onClick={() => setShowLiveVitals(false)} className="bg-gray-500 text-white rounded p-3">Cancel</button>
              <button type="button" disabled={loading} onClick={handleSubmitVitals} className="bg-green-600 text-white rounded p-3 disabled:opacity-60">
                {loading ? "Saving..." : "Record Vital Signs"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AmbulanceDashboard;
