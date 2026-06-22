-- 1. Create the lookup table for roles
CREATE TABLE "user_role" (
    "id" SERIAL PRIMARY KEY,
    "user_role" VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Create the user table
CREATE TABLE "user" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INT NOT NULL,
    CONSTRAINT "fk_user_role" FOREIGN KEY ("role_id") REFERENCES "user_role" ("id")
);

-- 3. Create the document table
CREATE TABLE "document" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "uploaded_by" INT NOT NULL,
    "role_access" JSONB NOT NULL, -- Storing arrays like ["admin", "editor"] dynamically
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_document_user" FOREIGN KEY ("uploaded_by") REFERENCES "user" ("id") ON DELETE CASCADE
);

-- Essential initial metadata lookup values (Standard DB state, not application seed code)
INSERT INTO "user_role" ("user_role") VALUES ('admin'), ('editor'), ('viewer');