export const getMyTopups = async (token) => {
  const res = await fetch(
    "http://localhost:3000/api/topups/my",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
};