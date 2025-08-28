export async function getUserSession(req: any) {
  // SSR: recibe el request (con cookies)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/validate-session`, {
    method: "POST",
    credentials: "include",
    headers: {
      cookie: req.headers.cookie,
    },
  });
  if (res.ok) {
    const { user } = await res.json();
    return user;
  }
  return null;
}