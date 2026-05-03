import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api, type ContactResponse } from '../services/api';

function formatUpdatedAt(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function WhatsAppPage() {
  const [contact, setContact] = useState<ContactResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [saving, setSaving] = useState(false);

  const loadContact = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getContact();
      setContact(data);
      setPhoneInput(data.phone_number);
    } catch {
      setContact({ phone_number: '', updated_at: null });
      setPhoneInput('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  useEffect(() => {
    (async () => {
      try {
        const roleData = await api.checkRole();
        setIsAdmin(roleData.is_admin || roleData.role === 'ADMIN');
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSaving(true);
    try {
      const data = await api.updateContact(phoneInput.trim());
      setContact(data);
      setPhoneInput(data.phone_number);
      setFormOpen(false);
      toast.success('Company WhatsApp saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save contact');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white shrink-0">WhatsApp</h1>
          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                setFormOpen((open) => {
                  const next = !open;
                  if (next) setPhoneInput(contact?.phone_number ?? '');
                  return next;
                })
              }
              className="shrink-0 px-4 py-2 bg-gray-900 dark:bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {formOpen ? 'Cancel' : 'Add number'}
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading…</p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Company number
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                  {contact?.phone_number?.trim() || 'No number added yet.'}
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {formatUpdatedAt(contact?.updated_at ?? null)}
                </p>
              </div>

              {isAdmin && formOpen && (
                <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  <div>
                    <label htmlFor="whatsapp-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone number
                    </label>
                    <input
                      id="whatsapp-phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+1 234 567 8901"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-gray-900 dark:bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-cyan-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
