import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import supabase from '../config/db';
import { UserInput, UserResponse } from '../models/user.model';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to generate tokens
const generateTokens = (user: { id: string; username: string; email: string }) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
    const jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN;

    if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error('JWT secrets are not defined in environment variables');
    }

    const options: SignOptions = {
        expiresIn: (jwtExpiresIn || '1h') as jwt.SignOptions['expiresIn'],
    };
    const refreshOptions: SignOptions = {
        expiresIn: (jwtRefreshExpiresIn || '7d') as jwt.SignOptions['expiresIn'],
    };

    const accessToken = jwt.sign(user, jwtSecret as Secret, options);
    const refreshToken = jwt.sign(user, jwtRefreshSecret as Secret, refreshOptions);

    return { accessToken, refreshToken };
};

// Signup controller
export const signup = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                status: 'error',
                message: 'Request body is required',
            });
        }

        const { username, email, password, firstName, lastName }: UserInput = req.body;

        // Validate input
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                status: 'error',
                message: 'All fields are required',
            });
        }

        // Check if user already exists
        const { data: existingUser, error: existingUserError } = await supabase
            .from('users')
            .select('*')
            .or('username.eq.' + username + ',email.eq.' + email)
            .maybeSingle();

        if (existingUserError) {
            console.error('Error checking existing user:', existingUserError);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to check existing user',
            });
        }

        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'User with this username or email already exists',
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                username,
                email,
                firstName,
                lastName,
                passwordHash,
            })
            .select()
            .single();

        if (error || !newUser) {
            console.error('Error creating user:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to create user',
            });
        }

        // Create user response without password
        const userResponse: UserResponse = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            createdAt: newUser.createdAt,
        };

        return res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: userResponse,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong during signup',
        });
    }
};

// Login controller
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required',
            });
        }

        // Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials',
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong during login',
        });
    }
};

// Refresh token controller
export const refreshToken = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token is required',
            });
        }

        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

        if (!jwtRefreshSecret) {
            throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as {
            id: string;
            username: string;
            email: string;
        };

        // Check if user exists
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid refresh token',
            });
        }

        // Generate new tokens
        const tokens = generateTokens({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        });
    } catch (error) {
        const err = error as { name?: string };
        if (err && err.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Refresh token expired. Please login again.',
            });
        }

        if (err && err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid refresh token. Please login again.',
            });
        }

        console.error('Token refresh error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong during token refresh',
        });
    }
};
