CREATE DATABASE clutchDatabase;

CREATE TABLE galleryImageObjs
(
    galleryImageObj_id SERIAL PRIMARY KEY,
    title VARCHAR(225),
    description VARCHAR(225),
    image VARCHAR(225)
);