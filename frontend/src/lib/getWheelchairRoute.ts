// /lib/getWheelchairRoute.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getWheelchairRoute(
    start: [number, number],
    end: [number, number]
  ) {
    const res = await fetch(
      `${API_BASE_URL}/map/wheelchair-route`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start,
          end
        }),
      }
    );
  
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Wheelchair route error: ${error}`);
    }
  
    const data = await res.json();
    return data;
  }
  