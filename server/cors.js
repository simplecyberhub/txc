// Express CORS configuration for local dev with cookies
import cors from 'cors';

export default cors({
  origin: 'http://localhost:5000', // adjust if your frontend runs elsewhere
  credentials: true, // allow cookies to be sent
});
