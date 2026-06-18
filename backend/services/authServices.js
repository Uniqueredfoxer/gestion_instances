import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateEmail, validateName, validatePassword } from '../utils/validators.js';

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRE_IN = process.env.JWT_EXPIRE_IN

const AuthService = {
    async registerUser(userData){
        const { nom, prenom, email, mdp, poste} = userData;
            
        if (!nom || !prenom || !email || !mdp || !poste) {
            return { success: false, error: "Missing required fields" };
        }
            
        if (!validateName(nom)) {
            return { success: false, error: "First name must be between 2 and 50 characters" };
        }
            
        if (!validateName(prenom)) {
            return { success: false, error: "Last name must be between 2 and 50 characters" };
        }
            
        if (!validateEmail(email)) {
            return { success: false, error: "Invalid email format" };
        }
            
        if (!validatePassword(mdp)) {
            return { success: false, error: "Password must be at least 8 characters long" };
        }

        const hasUppercase = /[A-Z]/.test(mdp);
        const hasLowercase = /[a-z]/.test(mdp);
        const hasNumber = /[0-9]/.test(mdp);
            
        if (!hasUppercase || !hasLowercase || !hasNumber) {
            return { success: false, error: "Password must contain at least one uppercase letter, one lowercase letter, and one number" };
        }
            
        try {
            const existingUser = await db.query(`SELECT email FROM users WHERE email = $1`, [email.toLowerCase()]);
            if (existingUser.rows.length > 0) {
                return { success: false, error: "User already exists" };
            }
                
            const hash = await bcrypt.hash(mdp, 10);
            const result = await db.query(
                    `INSERT INTO users(nom, prenom, email, mdp, poste) VALUES($1, $2, $3, $4, $5) RETURNING id, nom, prenom, email, poste, role_dir, statut`,
                    [nom.trim(), prenom.trim(), email.toLowerCase(), hash, poste]
                );
            const newUser = result.rows[0];
            return { success: true, data:newUser };
        } catch (err) {
            console.error("Error creating user: ", err);
            return { success: false, error: "Database error" };
        }
    },

    async login(userData){
        const { email, mdp } = userData;

        if (!email || !mdp) {
            return { success: false, error: "Email and password required" };
        }

        if (!validateEmail(email)) {
            return { success: false, error: "Invalid email format" };
        }

        if (mdp.length === 0) {
            return { success: false, error: "Password cannot be empty" };
        }
            
        try {
            const result = await db.query(
                    `SELECT id, nom, prenom, email, mdp, role_dir FROM users WHERE email = $1`,
                    [email.toLowerCase()]
                );
                
            if (result.rows.length === 0) {
                return { success: false, error: "User not found" };
            }
                
            const user = result.rows[0];
            const passwdMatch = await bcrypt.compare(mdp, user.mdp);
                
            if (!passwdMatch) {
                return { success: false, error: "Invalid credentials" };
            }
            console.log(`using ${JWT_SECRET} to sign the payload`)
            const token = jwt.sign({id: user.id, email: user.email, role: user.role_dir}, JWT_SECRET, {expiresIn: JWT_EXPIRE_IN})
            const { mdp: _, ...userWithoutPassword } = user;
            return { success: true, token, data: userWithoutPassword};
        } catch (err) {
            console.error("Error logging in: ", err);
            return { success: false, error: "Database error" };
        }
    }
}
export default AuthService;