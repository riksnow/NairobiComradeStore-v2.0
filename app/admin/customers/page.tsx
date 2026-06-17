"use client";

import { useEffect, useState } from "react";
import { formatDate, cn } from "@/lib/utils";
import { useStore } from "@/store/store-context";

type Customer = { _id: string; name: string; email: string; role: "Customer" | "Admin"; isActive: boolean; createdAt: string };

export default function AdminCustomersPage() {
  const { notify } = useStore();
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch("/api/admin/customers");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const patch = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/customers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const u = await res.json();
      setItems((l) => l.map((x) => (x._id === id ? { ...x, ...u } : x)));
      if (body.role) notify(`Role changed to ${body.role}`);
      else if (body.isActive === false) notify("Account suspended — user notified");
      else if (body.isActive === true) notify("Account reactivated — user notified");
    } else { const d = await res.json().catch(() => ({})); notify(d?.error ?? "Could not update."); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
    if (res.ok) { setItems((l) => l.filter((x) => x._id !== id)); notify("User deleted"); }
    else { const d = await res.json().catch(() => ({})); notify(d?.error ?? "Could not delete."); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-foreground md:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{loading ? "Loading…" : `${items.length} users`}</p>
      </div>

      {!loading && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium"></th>
            </tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => patch(u._id, { role: u.role === "Admin" ? "Customer" : "Admin" })}
                      className={cn("rounded-full px-2 py-0.5 text-xs", u.role === "Admin" ? "bg-primary/10 text-primary" : "bg-secondary text-foreground/70")}>
                      {u.role}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => patch(u._id, { isActive: !u.isActive })}
                      className={cn("rounded-full px-2 py-0.5 text-xs", u.isActive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
                      {u.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => del(u._id)} className="text-xs text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Click a role or status to toggle it. The store always keeps at least one active admin.</p>
    </div>
  );
}
