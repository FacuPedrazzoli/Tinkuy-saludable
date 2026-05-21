// This route is reserved for the future customer login flow.
// The CUSTOMER_LOGIN mutation seam already exists in src/lib/graphql/queries.ts.
// Do NOT wire customer UI here until that flow is explicitly scoped.
//
// For now, redirect to admin login — the only active auth path.
import { redirect } from 'next/navigation'

export default function LoginPage() {
  redirect('/admin/login')
}
