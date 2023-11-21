export const DATABASE_URL = {
    development:"mongodb://localhost:27017",
    production:""
}


export const DATABASE_NAME = 'whatsapp';

export const ADMIN_RESTRICTED_PATHS = [{path:'/users', method:"POST"},{ path:'/users/:username', method:"PUT"}];

export const JWT_SECRET_KEY = 'your-secret-key';