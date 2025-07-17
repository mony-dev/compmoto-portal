import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'nav-secret-key';
const payload = { role: 'EXTERNAL_SYSTEM', app: 'NAV' };

const token = jwt.sign(payload, secret, { expiresIn: '365d' });
console.log(token);
