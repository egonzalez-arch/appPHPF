'use client';
import { useState, useEffect, useMemo } from 'react';
import { ClinicEntity } from '@/lib/api/api.clinics';
import { useCompaniesLite } from '@/hooks/useCompaniesLite';

interface Props {
  mode: 'create' | 'edit';
  initialClinic?: ClinicEntity;
  submitting?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  allowChangeCompanyOnEdit?: boolean;
}

export default function ClinicForm({
  mode,
  initialClinic,
  submitting,
  onSubmit,
  onCancel,
  allowChangeCompanyOnEdit = false,
}: Props) {
  const { data: companies, isLoading: loadingCompanies, isError: errorCompanies } =
    useCompaniesLite(true);

  const [form, setForm] = useState({
    companyId: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    openingHours: '',
  });

  // Para filtrar empresas por texto (opcional)
  const [companyFilter, setCompanyFilter] = useState('');

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    const f = companyFilter.trim().toLowerCase();
    if (!f) return companies;
    return companies.filter(c => c.name.toLowerCase().includes(f));
  }, [companies, companyFilter]);

  useEffect(() => {
    if (mode === 'edit' && initialClinic) {
      setForm({
        companyId: initialClinic.companyId,
        name: initialClinic.name || '',
        address: initialClinic.address || '',
        phone: initialClinic.phone || '',
        email: initialClinic.email || '',
        openingHours: initialClinic.openingHours || '',
      });
    }
  }, [mode, initialClinic]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const base = {
      name: form.name,
      address: form.address,
      phone: form.phone || undefined,
      email: form.email || undefined,
      openingHours: form.openingHours || undefined,
    };

    if (mode === 'edit') {
      onSubmit({
        ...base,
        companyId:
          allowChangeCompanyOnEdit && form.companyId
            ? form.companyId
            : undefined,
      });
    } else {
      onSubmit({
        companyId: form.companyId,
        ...base,
      });
    }
  }

  const companySelectDisabled =
    mode === 'edit' && !allowChangeCompanyOnEdit;

  const noCompanies = !loadingCompanies && !errorCompanies && companies?.length === 0;

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold">
        {mode === 'edit' ? 'Editar Clínica' : 'Nueva Clínica'}
      </h2>

      {/* Selector de empresa */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex flex-col gap-2">
          <span>
            Empresa {mode === 'create' && <span className="text-red-500">*</span>}
          </span>

          {loadingCompanies && (
            <div className="text-xs text-gray-500">Cargando empresas...</div>
          )}
          {errorCompanies && (
            <div className="text-xs text-red-600">
              Error al cargar empresas
            </div>
          )}
          {noCompanies && (
            <div className="text-xs text-amber-600">
              No hay empresas. Crea una antes de registrar una clínica.
            </div>
          )}

          {!loadingCompanies && companies && companies.length > 6 && (
            <input
              type="text"
              placeholder="Filtrar empresas..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
              disabled={companySelectDisabled}
            />
          )}

          <select
            name="companyId"
            value={form.companyId}
            onChange={handleChange}
            disabled={
              submitting ||
              companySelectDisabled ||
              loadingCompanies ||
              !!errorCompanies ||
              noCompanies
            }
            required={mode === 'create'}
            className="border px-3 py-2 rounded bg-white"
          >
            <option value="">
              {companySelectDisabled
                ? 'Empresa asociada'
                : 'Selecciona una empresa'}
            </option>
            {filteredCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {mode === 'edit' && !allowChangeCompanyOnEdit && (
          <p className="text-xs text-gray-500">
            (El cambio de empresa está deshabilitado)
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre"
          className="border px-3 py-2 rounded"
          required
        />
        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Dirección"
          className="border px-3 py-2 rounded"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="border px-3 py-2 rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          type="email"
          className="border px-3 py-2 rounded"
        />
        <input
          name="openingHours"
          value={form.openingHours}
          onChange={handleChange}
          placeholder="Horario (ej: L-V 09:00-18:00)"
          className="border px-3 py-2 rounded md:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            submitting ||
            (mode === 'create' && (!form.companyId || noCompanies))
          }
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting
            ? 'Guardando...'
            : mode === 'edit'
            ? 'Guardar'
            : 'Crear'}
        </button>
      </div>
    </form>
  );
}