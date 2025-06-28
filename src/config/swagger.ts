import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BEBR API Documentation',
            version: '1.0.0',
            description: 'API documentation for BEBR application',
        },
        servers: [
            {
                url:
                    process.env.NODE_ENV === 'production'
                        ? 'https://beyond-running.vercel.app'
                        : 'http://localhost:3000',
                description:
                    process.env.NODE_ENV === 'production'
                        ? 'Production server'
                        : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
