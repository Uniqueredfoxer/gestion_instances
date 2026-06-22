import AuthService from "../services/authServices.js";

export const register = async (req, res) => {
    const result = await AuthService.registerUser(req.body);
    
    if (!result.success) {
        if (result.error === "Missing required fields" ||
            result.error === "Invalid email format" ||
            result.error === "Password must be at least 8 characters long" ||
            result.error === "Password must contain at least one uppercase letter, one lowercase letter, and one number" ||
            result.error === "First name must be between 2 and 50 characters" ||
            result.error === "Last name must be between 2 and 50 characters") {
            return res.status(400).json(result);
        }
        if (result.error === "User already exists") {
            return res.status(409).json(result);
        }

        return res.status(500).json(result);
    }
    
    res.status(201).json(result);
}

export const loginUser = async (req, res) => {
    const result = await AuthService.login(req.body);
    
    if (!result.success) {
        if (result.error === "email et mot de passe requis" ||
            result.error === "format d'email invalide" ||
            result.error === "le mot de passe ne peut pas etre vide") {
            return res.status(400).json(result);
        }
        if (result.error === "email ou mot de passe incorrect") {
            return res.status(401).json(result);
        }
        return res.status(500).json(result);
    }
    res.status(200).json(result)
}