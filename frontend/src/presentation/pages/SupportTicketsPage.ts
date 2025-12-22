import { httpGetAuth } from '../../infrastructure/http/client';

type SupportTicketDto = {
  ticketID: number;
  userID?: number;
  subject: string;
  description: string;
  status: 'Pending' | 'InProgress' | 'Completed' | string;
};

// Prikaz statusa na UI (lokalizacija)
const STATUS_LABELS: Record<string, string> = {
  Pending: 'Na čekanju',
  InProgress: 'U obradi',
  Completed: 'Završeno',
};

const STATUS_CLASS: Record<string, string> = {
  Pending: 'badge badge-pending',
  InProgress: 'badge badge-progress',
  Completed: 'badge badge-done',
};

async function fetchMyTickets(status?: string, token?: string): Promise<SupportTicketDto[]> {
  const path = status
    ? `/api/supporttickets/mine?status=${encodeURIComponent(status)}`
    : `/api/supporttickets/mine`;
  return await httpGetAuth<SupportTicketDto[]>(path, token);
}

function renderTable(tickets: SupportTicketDto[]): string {
  if (!tickets.length) {
    return `<p class="muted">Nema zahtjeva.</p>`;
  }
  return `
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Naslov</th>
          <th>Opis</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${tickets
          .map(
            (t) => `
          <tr>
            <td>${t.ticketID}</td>
            <td>${escapeHtml(t.subject)}</td>
            <td>${escapeHtml(t.description)}</td>
            <td><span class="${STATUS_CLASS[t.status] || 'badge'}">${STATUS_LABELS[t.status] || t.status}</span></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function renderMySupportTicketsPage(container: HTMLElement): void {
  const token = localStorage.getItem('token') || undefined;

  if (!token) {
    container.innerHTML = `<p>Morate biti prijavljeni da biste vidjeli svoje zahtjeve.</p>`;
    return;
  }

  container.innerHTML = `
    <section class="container">
      <div class="toolbar">
        <h1>Moji zahtjevi</h1>
        <div class="filters">
          <label>Status:</label>
          <select id="status-filter">
            <option value="">Svi</option>
            <option value="Pending">Na čekanju</option>
            <option value="InProgress">U obradi</option>
            <option value="Completed">Završeno</option>
          </select>
          <button id="refresh-btn" type="button">Osvježi</button>
        </div>
      </div>
      <div id="tickets-wrap">
        <p class="muted">Učitavanje...</p>
      </div>
    </section>
  `;

  const wrap = document.getElementById('tickets-wrap') as HTMLElement;
  const filter = document.getElementById('status-filter') as HTMLSelectElement;
  const refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement;

  async function load() {
    wrap.innerHTML = `<p class="muted">Učitavanje...</p>`;
    try {
      const status = filter.value || undefined;
      const tickets = await fetchMyTickets(status, token);
      wrap.innerHTML = renderTable(tickets);
    } catch (err: any) {
      wrap.innerHTML = `<p class="error">Greška pri učitavanju: ${err?.message ?? 'nepoznato'}</p>`;
    }
  }

  refreshBtn.addEventListener('click', load);
  filter.addEventListener('change', load);

  load();
}
