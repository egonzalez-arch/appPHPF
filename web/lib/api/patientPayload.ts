// Versión actualizada con normalización robusta
export interface PatientUpdateInput {
  birthDate?: string | Date;
  PatientSex?: string;
  bloodType?: string;
  allergies?: string[] | string | null;
  emergencyContact?: any;
}

function isPlainObject(v: any) {
  return v && typeof v === 'object' && !Array.isArray(v);
}

export function buildPatientUpdatePayload(raw: PatientUpdateInput) {
  const payload: any = {};

  // birthDate -> YYYY-MM-DD
  if (raw.birthDate) {
    const d =
      typeof raw.birthDate === 'string'
        ? raw.birthDate
        : raw.birthDate.toISOString();
    payload.birthDate = d.substring(0, 10);
  }

  if (raw.PatientSex) payload.PatientSex = raw.PatientSex;
  if (raw.bloodType) payload.bloodType = raw.bloodType;

  if (raw.allergies !== undefined && raw.allergies !== null) {
    if (Array.isArray(raw.allergies)) {
      payload.allergies = raw.allergies.map(String);
    } else if (typeof raw.allergies === 'string') {
      const trimmed = raw.allergies.trim();
      if (trimmed === '') {
        // Puedes decidir no enviarla o enviarla como []
        payload.allergies = [];
      } else {
        // Intentar JSON o separar por comas
        try {
          const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              payload.allergies = parsed.map(String);
            } else {
              payload.allergies = trimmed
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            }
        } catch {
          payload.allergies = trimmed
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }
  }

  if (raw.emergencyContact !== undefined && raw.emergencyContact !== null) {
    let ec = raw.emergencyContact;

    if (typeof ec === 'string') {
      const trimmed = ec.trim();
      if (trimmed === '') {
        ec = undefined;
      } else {
        try {
          const parsed = JSON.parse(trimmed);
          ec = parsed;
        } catch {
          // Podrías intentar un formato key:value;key:value si quisieras
          ec = undefined;
        }
      }
    }

    if (isPlainObject(ec)) {
      // Limpia propiedades vacías
      const cleaned: Record<string, any> = {};
      Object.entries(ec).forEach(([k, v]) => {
        if (
          v !== undefined &&
          v !== null &&
          !(typeof v === 'string' && v.trim() === '')
        ) {
          cleaned[k] = v;
        }
      });
      if (Object.keys(cleaned).length > 0) {
        payload.emergencyContact = cleaned;
      }
    }
    // Si no es objeto plano o quedó vacío, simplemente NO lo añadimos.
  }

  return payload;
}