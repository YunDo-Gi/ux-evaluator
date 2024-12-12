CREATE DATABASE ux_tracking;
USE ux_tracking;

CREATE TABLE sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(255),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    device_info JSON
);

CREATE TABLE mouse_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    x INT,
    y INT,
    path VARCHAR(255),
    timestamp TIMESTAMP,
    emotion_type VARCHAR(50),
    emotion_confidence FLOAT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE clicks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    x INT,
    y INT,
    element_info JSON,
    path VARCHAR(255),
    timestamp TIMESTAMP,
    emotion_type VARCHAR(50),
    emotion_confidence FLOAT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE scroll_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    scroll_x INT,
    scroll_y INT,
    path VARCHAR(255),
    timestamp TIMESTAMP,
    emotion_type VARCHAR(50),
    emotion_confidence FLOAT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE hover_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    element_info JSON,
    start_time TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration INT NULL,
    path VARCHAR(255),
    start_emotion_type VARCHAR(50),
    start_emotion_confidence FLOAT,
    end_emotion_type VARCHAR(50),
    end_emotion_confidence FLOAT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE page_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(36),
    path VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration INT NULL,
    type VARCHAR(50),
    emotion_type VARCHAR(50),
    emotion_confidence FLOAT,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);