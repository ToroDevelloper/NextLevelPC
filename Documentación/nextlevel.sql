-- =====================================================
-- NEXTLEVEL PC - SCRIPT COMPLETO DE BASE DE DATOS
-- Fecha: 21 de Noviembre 2025
-- Descripción: Script completo con estructura y datos
-- =====================================================

-- Configuración inicial
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- =====================================================
-- CREACIÓN DE BASE DE DATOS
-- =====================================================

DROP DATABASE IF EXISTS `nextlevel`;
CREATE DATABASE IF NOT EXISTS `nextlevel` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `nextlevel`;

-- =====================================================
-- TABLA: roles
-- Descripción: Roles de usuario (admin, cliente, empleado)
-- =====================================================

CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` (`id`, `nombre`) VALUES
(1, 'admin'),
(2, 'cliente'),
(3, 'empleado');

-- =====================================================
-- TABLA: estado
-- Descripción: Estados para productos (activo/inactivo)
-- =====================================================

CREATE TABLE IF NOT EXISTS `estado` (
  `id` TINYINT(10) NOT NULL DEFAULT 1,
  `nombre` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `estado` (`id`, `nombre`) VALUES
(1, 'activo'),
(2, 'inactivo');

-- =====================================================
-- TABLA: usuarios
-- Descripción: Usuarios del sistema
-- =====================================================

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) DEFAULT NULL,
  `correo` VARCHAR(150) NOT NULL,
  `hash_password` VARCHAR(255) NOT NULL,
  `rol_id` INT(11) DEFAULT NULL,
  `estado` ENUM('activo','inactivo') DEFAULT 'activo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `correo`, `hash_password`, `rol_id`, `estado`) VALUES
(1, 'Admin', 'Sistema', 'admin@nextlevel.com', '$2b$10$6XSEjTXTVECb/bk62kBOcum7m4/ATUwGx0.SS6uCptlxHeDphChny', 1, 'activo'),
(2, 'Juan', 'Pérez', 'juan.perez@email.com', '$2b$10$6XSEjTXTVECb/bk62kBOcum7m4/ATUwGx0.SS6uCptlxHeDphChny', 2, 'activo'),
(3, 'María', 'González', 'maria.gonzalez@email.com', '$2b$10$6XSEjTXTVECb/bk62kBOcum7m4/ATUwGx0.SS6uCptlxHeDphChny', 2, 'activo'),
(6, 'Luis', 'Hernández', 'luis.hernandez@email.com', '$2b$10$6XSEjTXTVECb/bk62kBOcum7m4/ATUwGx0.SS6uCptlxHeDphChny', 3, 'activo');


-- =====================================================
-- TABLA: refresh_tokens
-- Descripción: Tokens de autenticación
-- =====================================================

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token` VARCHAR(512) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- TABLA: categorias
-- Descripción: Categorías de productos
-- =====================================================

CREATE TABLE IF NOT EXISTS `categorias` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `tipo` ENUM('producto','servicio') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `categorias` (`id`, `nombre`, `tipo`) VALUES
(1, 'Procesadores', 'producto'),
(2, 'Tarjetas Gráficas', 'producto'),
(3, 'Memorias RAM', 'producto'),
(4, 'Almacenamiento', 'producto'),
(5, 'Placas Madre', 'producto'),
(6, 'Fuentes de Poder', 'producto'),
(7, 'Gabinetes', 'producto'),
(8, 'Refrigeración', 'producto'),
(9, 'Periféricos', 'producto'),
(10, 'Monitores', 'producto');

-- =====================================================
-- TABLA: productos
-- Descripción: Productos de la tienda
-- =====================================================

CREATE TABLE IF NOT EXISTS `productos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `descripcion_corta` VARCHAR(300) NULL,
  `descripcion_detallada` TEXT NULL,
  `especificaciones` TEXT NULL,
  `categoria_id` INT(11) NOT NULL,
  `precio_actual` DECIMAL(12,2) NOT NULL,
  `stock` INT(11) DEFAULT 0,
  `estado` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  KEY `estado` (`estado`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`estado`) REFERENCES `estado` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `productos` (`nombre`, `descripcion_corta`, `descripcion_detallada`, `especificaciones`, `categoria_id`, `precio_actual`, `stock`, `estado`) VALUES
-- Procesadores
('AMD Ryzen 9 7950X', 'Procesador de alto rendimiento 16 núcleos', 'Procesador AMD Ryzen serie 7000 con arquitectura Zen 4, ideal para gaming y creación de contenido profesional.', 'Núcleos: 16, Hilos: 32, Frecuencia Base: 4.5GHz, Frecuencia Turbo: 5.7GHz, Socket: AM5, TDP: 170W', 1, 2500000.00, 15, 1),
('Intel Core i9-13900K', 'Procesador Intel de 13va generación', 'CPU Intel Raptor Lake con 24 núcleos, perfecto para multitarea extrema y gaming de alta gama.', 'Núcleos: 24 (8P+16E), Hilos: 32, Frecuencia: hasta 5.8GHz, Socket: LGA1700, TDP: 125W', 1, 2450000.00, 12, 1),
('AMD Ryzen 7 7700X', 'Procesador gaming 8 núcleos', 'Excelente rendimiento para juegos y aplicaciones exigentes con tecnología AMD 3D V-Cache.', 'Núcleos: 8, Hilos: 16, Frecuencia: 4.5-5.4GHz, Socket: AM5, TDP: 105W', 1, 1500000.00, 25, 1),
('Intel Core i5-13600K', 'Procesador mid-range potente', 'Ideal para gaming competitivo y tareas productivas con excelente relación precio-rendimiento.', 'Núcleos: 14 (6P+8E), Hilos: 20, Frecuencia: hasta 5.1GHz, Socket: LGA1700, TDP: 125W', 1, 1350000.00, 30, 1),

-- Tarjetas Gráficas
('NVIDIA RTX 4090', 'GPU tope de gama 4K gaming', 'La tarjeta gráfica más potente para gaming 4K, ray tracing y creación de contenido profesional.', 'Memoria: 24GB GDDR6X, CUDA Cores: 16384, Boost Clock: 2.52GHz, TDP: 450W', 2, 6800000.00, 8, 1),
('AMD Radeon RX 7900 XTX', 'GPU AMD flagship', 'Rendimiento excepcional en 4K con tecnología RDNA 3 y 24GB de memoria.', 'Memoria: 24GB GDDR6, Stream Processors: 6144, Boost: 2.5GHz, TDP: 355W', 2, 4200000.00, 10, 1),
('NVIDIA RTX 4070 Ti', 'GPU gaming 1440p/4K', 'Perfecta para gaming en alta resolución con ray tracing y DLSS 3.', 'Memoria: 12GB GDDR6X, CUDA Cores: 7680, Boost: 2.61GHz, TDP: 285W', 2, 3400000.00, 18, 1),
('AMD Radeon RX 7800 XT', 'GPU 1440p gaming', 'Excelente opción para gaming en 1440p con gran valor y rendimiento.', 'Memoria: 16GB GDDR6, Stream Processors: 3840, Boost: 2.43GHz, TDP: 263W', 2, 2300000.00, 22, 1),

-- Memorias RAM
('Corsair Vengeance DDR5 32GB', 'RAM DDR5 6000MHz', 'Kit de memoria de alta velocidad para plataformas AMD e Intel más recientes.', 'Capacidad: 32GB (2x16GB), Velocidad: 6000MHz, Latencia: CL36, RGB: No', 3, 650000.00, 40, 1),
('G.Skill Trident Z5 RGB 32GB', 'RAM RGB DDR5 Premium', 'Memoria DDR5 con iluminación RGB personalizable y rendimiento extremo.', 'Capacidad: 32GB (2x16GB), Velocidad: 6400MHz, Latencia: CL32, RGB: Sí', 3, 800000.00, 35, 1),
('Kingston Fury Beast 16GB DDR4', 'RAM DDR4 gaming', 'Memoria confiable para builds DDR4 con excelente compatibilidad.', 'Capacidad: 16GB (2x8GB), Velocidad: 3200MHz, Latencia: CL16, RGB: No', 3, 250000.00, 60, 1),
('Corsair Dominator Platinum RGB 64GB', 'RAM enthusiast DDR5', 'Kit premium de 64GB para workstations y gaming extremo.', 'Capacidad: 64GB (2x32GB), Velocidad: 5600MHz, Latencia: CL36, RGB: Sí', 3, 1250000.00, 15, 1),

-- Almacenamiento
('Samsung 990 Pro 2TB', 'SSD NVMe Gen4 ultra rápido', 'SSD PCIe 4.0 con velocidades de lectura hasta 7,450 MB/s.', 'Capacidad: 2TB, Interfaz: PCIe 4.0 x4, Lectura: 7450MB/s, Escritura: 6900MB/s', 4, 800000.00, 45, 1),
('WD Black SN850X 1TB', 'SSD gaming Gen4', 'Optimizado para gaming con tiempos de carga ultra rápidos.', 'Capacidad: 1TB, Interfaz: PCIe 4.0 x4, Lectura: 7300MB/s, Escritura: 6300MB/s', 4, 500000.00, 50, 1),
('Crucial P3 Plus 4TB', 'SSD gran capacidad', 'Almacenamiento masivo con excelente rendimiento PCIe Gen4.', 'Capacidad: 4TB, Interfaz: PCIe 4.0 x4, Lectura: 5000MB/s, Escritura: 4200MB/s', 4, 1250000.00, 25, 1),
('Seagate FireCuda 530 2TB', 'SSD Pro Gen4', 'SSD de alto rendimiento con disipador para uso intensivo.', 'Capacidad: 2TB, Interfaz: PCIe 4.0 x4, Lectura: 7300MB/s, Escritura: 6900MB/s', 4, 1050000.00, 30, 1),

-- Placas Madre
('ASUS ROG Crosshair X670E Hero', 'Motherboard AMD AM5 premium', 'Placa madre tope de gama para Ryzen 7000 con todas las características.', 'Socket: AM5, Chipset: X670E, RAM: DDR5, PCIe 5.0, WiFi 6E, ATX', 5, 2900000.00, 12, 1),
('MSI MPG Z790 Carbon WiFi', 'Motherboard Intel Z790', 'Placa robusta para procesadores Intel 13va gen con conectividad completa.', 'Socket: LGA1700, Chipset: Z790, RAM: DDR5, PCIe 5.0, WiFi 6E, ATX', 5, 1900000.00, 18, 1),
('Gigabyte B650 Aorus Elite AX', 'Motherboard AMD precio-valor', 'Excelente opción mid-range para Ryzen 7000 con WiFi integrado.', 'Socket: AM5, Chipset: B650, RAM: DDR5, PCIe 4.0, WiFi 6, ATX', 5, 950000.00, 28, 1),
('ASRock B760M Pro RS', 'Motherboard Intel Micro-ATX', 'Placa compacta para builds Intel de 13va generación.', 'Socket: LGA1700, Chipset: B760, RAM: DDR4/DDR5, PCIe 4.0, Micro-ATX', 5, 680000.00, 35, 1),

-- Fuentes de Poder
('Corsair RM1000x 1000W', 'PSU modular 80+ Gold', 'Fuente totalmente modular con certificación 80 Plus Gold.', 'Potencia: 1000W, Certificación: 80+ Gold, Modular: Full, Garantía: 10 años', 6, 720000.00, 25, 1),
('EVGA SuperNOVA 850 G6', 'PSU 850W eficiente', 'Fuente de alta eficiencia con cables completamente modulares.', 'Potencia: 850W, Certificación: 80+ Gold, Modular: Full, Garantía: 10 años', 6, 590000.00, 30, 1),
('Seasonic Focus GX-750', 'PSU 750W confiable', 'Fuente de calidad premium con excelente regulación de voltaje.', 'Potencia: 750W, Certificación: 80+ Gold, Modular: Full, Garantía: 10 años', 6, 500000.00, 40, 1),
('be quiet! Straight Power 11 650W', 'PSU silenciosa 650W', 'Fuente ultra silenciosa con componentes de primera calidad.', 'Potencia: 650W, Certificación: 80+ Gold, Modular: Full, Garantía: 5 años', 6, 420000.00, 35, 1),

-- Gabinetes
('Lian Li O11 Dynamic EVO', 'Case ATX vidrio templado', 'Gabinete moderno con excelente flujo de aire y espacio para watercooling.', 'Factor: ATX, Paneles: Vidrio templado, Ventiladores: 9x slots, USB: Type-C', 7, 720000.00, 20, 1),
('NZXT H7 Flow', 'Case gaming airflow', 'Diseño minimalista con panel mesh para máximo flujo de aire.', 'Factor: ATX, Paneles: Mesh frontal, Ventiladores: 3x incluidos, USB: Type-C', 7, 550000.00, 25, 1),
('Corsair 4000D Airflow', 'Case precio-valor', 'Gabinete popular con excelente balance entre precio y características.', 'Factor: ATX, Paneles: Mesh, Ventiladores: 2x incluidos, Cable management', 7, 420000.00, 35, 1),
('Fractal Design Meshify 2 Compact', 'Case compacto mesh', 'Gabinete ATX compacto con diseño mesh angular distintivo.', 'Factor: ATX Compact, Paneles: Mesh angular, Ventiladores: 3x slots, Modular', 7, 500000.00, 22, 1),

-- Refrigeración
('NZXT Kraken X73', 'AIO 360mm RGB', 'Refrigeración líquida todo-en-uno con pantalla personalizable.', 'Tamaño: 360mm, Ventiladores: 3x120mm, RGB: Sí, Compatibilidad: Universal', 8, 850000.00, 18, 1),
('Noctua NH-D15', 'Cooler aire dual-tower', 'Refrigerador por aire de alto rendimiento ultra silencioso.', 'Tipo: Aire, Torres: Dual, Ventiladores: 2x140mm, TDP: 250W+', 8, 460000.00, 28, 1),
('Corsair iCUE H150i Elite', 'AIO 360mm premium', 'AIO de alta gama con ventiladores magnéticos ML RGB.', 'Tamaño: 360mm, Ventiladores: 3x120mm ML RGB, Software: iCUE', 8, 800000.00, 20, 1),
('be quiet! Dark Rock Pro 4', 'Cooler aire silencioso', 'Rendimiento excepcional con operación ultra silenciosa.', 'Tipo: Aire, Torres: Dual, Ventiladores: 2x120/135mm, TDP: 250W', 8, 380000.00, 32, 1),

-- Periféricos
('Logitech G Pro X Superlight', 'Mouse gaming wireless', 'Mouse ultraligero profesional para esports.', 'Peso: 63g, Sensor: HERO 25K, DPI: 25,600, Batería: 70 horas', 9, 630000.00, 45, 1),
('Razer BlackWidow V4 Pro', 'Teclado mecánico RGB', 'Teclado gaming full-size con switches mecánicos personalizables.', 'Switches: Green/Yellow/Orange, RGB: Per-key, Media: Dial + Teclas', 9, 970000.00, 30, 1),
('SteelSeries Arctis Nova Pro', 'Headset gaming premium', 'Auriculares con audio de alta fidelidad y cancelación de ruido.', 'Drivers: 40mm, Micrófono: Retráctil, Conexión: Wireless/Wired', 9, 1480000.00, 22, 1),
('HyperX Alloy Origins 65', 'Teclado 65% compacto', 'Teclado mecánico compacto ideal para escritorios pequeños.', 'Formato: 65%, Switches: HyperX Red, RGB: Sí, Cable: Desmontable', 9, 420000.00, 40, 1),

-- Monitores
('Samsung Odyssey G9', 'Monitor ultrawide curvo 49"', 'Monitor gaming curvo super ultrawide 5120x1440 240Hz.', 'Tamaño: 49", Resolución: 5120x1440, Refresh: 240Hz, Panel: VA, HDR1000', 10, 5900000.00, 8, 1),
('LG 27GP950-B', 'Monitor 4K 144Hz gaming', 'Monitor 4K con alta tasa de refresco para gaming y productividad.', 'Tamaño: 27", Resolución: 3840x2160, Refresh: 144Hz, Panel: Nano IPS', 10, 3400000.00, 15, 1),
('ASUS ROG Swift PG279QM', 'Monitor 1440p 240Hz', 'Monitor gaming rápido con tecnología Fast IPS.', 'Tamaño: 27", Resolución: 2560x1440, Refresh: 240Hz, Panel: Fast IPS', 10, 2950000.00, 18, 1),
('Dell S2722DGM', 'Monitor curved gaming', 'Monitor curvo VA gaming con excelente contraste.', 'Tamaño: 27", Resolución: 2560x1440, Refresh: 165Hz, Panel: VA Curved', 10, 1250000.00, 25, 1);

-- =====================================================
-- TABLA: imagenes_productos
-- Descripción: Imágenes de productos
-- =====================================================

CREATE TABLE IF NOT EXISTS `imagenes_productos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `producto_id` INT(11) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `es_principal` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `imagenes_productos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Imágenes de ejemplo para productos
INSERT INTO `imagenes_productos` (`producto_id`, `url`, `es_principal`) VALUES
(1, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', 1),
(2, 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&q=80', 1),
(3, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80', 1),
(4, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80', 1),
(5, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80', 1),
(6, 'https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&q=80', 1),
(7, 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80', 1),
(8, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', 1);

-- =====================================================
-- TABLA: servicios
-- Descripción: Servicios técnicos ofrecidos
-- =====================================================

CREATE TABLE IF NOT EXISTS `servicios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  `precio` DECIMAL(12,2) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `imagen_url` VARCHAR(255) DEFAULT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  `tipo` ENUM('basico','avanzado') DEFAULT 'basico',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `servicios` (`nombre`, `tipo`, `precio`, `descripcion`, `imagen_url`, `activo`) VALUES
-- SERVICIOS BÁSICOS
('Instalación de Windows/Linux', 'basico', 80000.00,
'Instalación limpia de sistema operativo Windows o Linux. Incluye drivers básicos, actualizaciones de seguridad, antivirus gratuito y configuración inicial del sistema.',
'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80', 1),

('Limpieza y Mantenimiento Básico', 'basico', 60000.00,
'Limpieza física de componentes, eliminación de archivos temporales, optimización de inicio de Windows y verificación de salud de disco duro.',
'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80', 1),

('Instalación de Office y Programas', 'basico', 50000.00,
'Instalación de suite Office (Word, Excel, PowerPoint), navegadores, reproductores multimedia, compresores de archivos y programas básicos.',
'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&q=80', 1),

('Diagnóstico de Problemas', 'basico', 40000.00,
'Diagnóstico completo de hardware y software para identificar fallas. Incluye reporte detallado de problemas encontrados y cotización de reparación.',
'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&q=80', 1),

('Configuración de Router WiFi', 'basico', 50000.00,
'Configuración de router inalámbrico, cambio de contraseñas, optimización de canales WiFi, configuración de seguridad WPA3 y pruebas de velocidad.',
'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80', 1),

('Respaldo de Datos (Backup)', 'basico', 90000.00,
'Respaldo completo de documentos, fotos, videos y archivos importantes a disco externo o nube. Incluye verificación de integridad de datos.',
'https://images.unsplash.com/photo-1544654803-b69140b285a1?w=800&q=80', 1),

-- SERVICIOS AVANZADOS
('Ensamblaje de PC Gaming/Workstation', 'avanzado', 150000.00,
'Armado profesional de PC gaming o estación de trabajo. Incluye: selección optimizada de componentes, ensamblaje con cable management, instalación de SO y drivers, overclock seguro y garantía de 6 meses.',
'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', 1),

('Reparación Avanzada de Laptops', 'avanzado', 250000.00,
'Reparación de nivel experto: reballing de GPU/CPU, cambio de bisagras, reemplazo de pantalla LED/OLED, upgrading a SSD NVMe, expansión de RAM y renovación de pasta térmica.',
'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', 1),

('Recuperación de Datos Profesional', 'avanzado', 350000.00,
'Recuperación avanzada de datos de discos duros dañados, SSD, RAID, tarjetas SD corruptas. Utilizamos software forense. Evaluación gratuita, pago solo si recuperamos tus datos.',
'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80', 1),

('Instalación de Red Empresarial', 'avanzado', 1500000.00,
'Diseño e implementación de red empresarial completa. Incluye: cableado estructurado Cat6/Cat7, switches administrables, puntos de acceso WiFi 6, servidor de dominio y firewall.',
'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', 1),

('Configuración de Servidor (Windows Server/Linux)', 'avanzado', 800000.00,
'Instalación y configuración completa de servidor empresarial: Active Directory, DNS, DHCP, File Server, controlador de dominio, políticas de grupo y respaldos automáticos.',
'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80', 1),

('Plan de Soporte Técnico Empresarial', 'avanzado', 500000.00,
'Soporte técnico integral mensual: atención 24/7 vía WhatsApp/email/llamada, 3 visitas presenciales incluidas, mantenimiento preventivo mensual y monitoreo remoto.',
'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80', 1);

-- =====================================================
-- TABLA: servicio_imagenes
-- Descripción: Galería de imágenes para servicios
-- =====================================================

CREATE TABLE IF NOT EXISTS `servicio_imagenes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `servicio_id` INT(11) NOT NULL,
  `url` VARCHAR(500) NOT NULL COMMENT 'Image URL or path',
  `alt_text` VARCHAR(255) NULL COMMENT 'Alt text for SEO and accessibility',
  `orden` INT DEFAULT 0 COMMENT 'Display order (0 = first)',
  `es_principal` TINYINT(1) DEFAULT 0 COMMENT 'Is this the main/featured image?',
  `activo` TINYINT(1) DEFAULT 1 COMMENT 'Soft delete flag',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `servicio_id` (`servicio_id`),
  KEY `idx_servicio_activo` (`servicio_id`, `activo`),
  KEY `idx_servicio_orden` (`servicio_id`, `orden`),
  KEY `idx_principal` (`servicio_id`, `es_principal`),
  CONSTRAINT `servicio_imagenes_ibfk_1` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Gallery images for services';

-- Galerías para servicios (ejemplos)
INSERT INTO `servicio_imagenes` (`servicio_id`, `url`, `alt_text`, `orden`, `es_principal`) VALUES
-- Servicio 1: Instalación de Windows/Linux
(1, 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80', 'Instalación de sistema operativo', 0, 1),
(1, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', 'Configuración de Windows', 1, 0),
(1, 'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=800&q=80', 'Escritorio configurado', 2, 0),

-- Servicio 7: Ensamblaje de PC
(7, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', 'PC Gaming ensamblado', 0, 1),
(7, 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80', 'Cable management profesional', 1, 0),
(7, 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80', 'Testing y benchmarks', 2, 0);

-- =====================================================
-- TABLA: ordenes
-- Descripción: Órdenes de compra
-- =====================================================

CREATE TABLE IF NOT EXISTS `ordenes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` INT(11) DEFAULT NULL,
  `tipo` ENUM('producto','servicio','mixto') NOT NULL,
  `cita_servicio_id` INT NULL COMMENT 'ID de la cita de servicio asociada',
  `numero_orden` VARCHAR(50) NOT NULL,
  `total` DECIMAL(12,2) DEFAULT 0.00,
  `estado_orden` ENUM('pendiente','procesando','completada','cancelada') DEFAULT 'pendiente',
  `estado_pago` ENUM('pendiente','pagado','reembolsado') DEFAULT 'pendiente',
  `stripe_payment_intent_id` VARCHAR(255) DEFAULT NULL,
  `fecha_pago` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `cliente_id` (`cliente_id`),
  KEY `idx_stripe_payment_intent` (`stripe_payment_intent_id`),
  KEY `idx_orden_cita_id` (`cita_servicio_id`),
  CONSTRAINT `ordenes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Órdenes de ejemplo
INSERT INTO `ordenes` (`cliente_id`, `tipo`, `numero_orden`, `total`, `estado_orden`, `estado_pago`, `created_at`) VALUES
(2, 'producto', 'ORD-1732234567890', 5000000.00, 'completada', 'pagado', '2025-11-15 10:30:00'),
(3, 'producto', 'ORD-1732234567891', 2300000.00, 'completada', 'pagado', '2025-11-16 14:20:00'),
(2, 'servicio', 'ORD-1732234567892', 80000.00, 'completada', 'pagado', '2025-11-17 09:15:00'),
(3, 'producto', 'ORD-1732234567893', 11000000.00, 'procesando', 'pagado', '2025-11-18 16:45:00'),
(2, 'servicio', 'ORD-1732234567894', 1500000.00, 'pendiente', 'pagado', '2025-11-19 11:30:00'),
(3, 'producto', 'ORD-1732234567895', 3400000.00, 'completada', 'pagado', '2025-11-20 13:10:00');

-- =====================================================
-- TABLA: orden_items
-- Descripción: Items de cada orden
-- =====================================================

CREATE TABLE IF NOT EXISTS `orden_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `orden_id` INT(11) DEFAULT NULL,
  `producto_id` INT(11) DEFAULT NULL,
  `servicio_id` INT(11) DEFAULT NULL,
  `tipo` ENUM('producto','servicio') NOT NULL,
  `descripcion` VARCHAR(255) DEFAULT NULL,
  `cantidad` INT(11) DEFAULT 1,
  `precio_unitario` DECIMAL(12,2) DEFAULT NULL,
  `subtotal` DECIMAL(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orden_id` (`orden_id`),
  KEY `producto_id` (`producto_id`),
  KEY `idx_servicio_id` (`servicio_id`),
  CONSTRAINT `orden_items_ibfk_1` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orden_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_orden_items_servicio` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Items de órdenes
INSERT INTO `orden_items` (`orden_id`, `producto_id`, `servicio_id`, `tipo`, `descripcion`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(1, 1, NULL, 'producto', 'AMD Ryzen 9 7950X', 1, 2500000.00, 2500000.00),
(1, 1, NULL, 'producto', 'AMD Ryzen 9 7950X', 1, 2500000.00, 2500000.00),
(2, 8, NULL, 'producto', 'AMD Radeon RX 7800 XT', 1, 2300000.00, 2300000.00),
(3, NULL, 1, 'servicio', 'Instalación de Windows/Linux', 1, 80000.00, 80000.00),
(4, 5, NULL, 'producto', 'NVIDIA RTX 4090', 1, 6800000.00, 6800000.00),
(4, 6, NULL, 'producto', 'AMD Radeon RX 7900 XTX', 1, 4200000.00, 4200000.00),
(5, NULL, 7, 'servicio', 'Ensamblaje de PC Gaming/Workstation', 1, 1500000.00, 1500000.00),
(6, 38, NULL, 'producto', 'LG 27GP950-B', 1, 3400000.00, 3400000.00);

-- =====================================================
-- TABLA: citas_servicios
-- Descripción: Citas agendadas para servicios
-- =====================================================

CREATE TABLE IF NOT EXISTS `citas_servicios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `servicio_id` INT(11) NOT NULL,
  `nombre_cliente` VARCHAR(255) NOT NULL,
  `email_cliente` VARCHAR(255) NOT NULL,
  `telefono_cliente` VARCHAR(50) NOT NULL,
  `direccion_cliente` TEXT NOT NULL,
  `fecha_cita` DATETIME NOT NULL,
  `descripcion_problema` TEXT DEFAULT NULL,
  `estado` ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
  `estado_pago` ENUM('pendiente', 'pagado', 'cancelado') DEFAULT 'pendiente',
  `orden_id` INT NULL,
  `created_at` TIMESTAMP NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `servicio_id` (`servicio_id`),
  KEY `idx_cita_estado_pago` (`estado_pago`),
  KEY `idx_cita_orden_id` (`orden_id`),
  CONSTRAINT `citas_servicios_ibfk_1` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cita_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Citas de ejemplo
INSERT INTO `citas_servicios` (`servicio_id`, `nombre_cliente`, `email_cliente`, `telefono_cliente`, `direccion_cliente`, `fecha_cita`, `descripcion_problema`, `estado`, `estado_pago`, `orden_id`) VALUES
(1, 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '555-0104', 'Av. Principal 456', '2025-11-25 10:00:00', 'Necesito instalar Windows 11 y configurar drivers', 'confirmada', 'pagado', 3),
(7, 'Sofia López', 'sofia.lopez@email.com', '555-0107', 'Calle Comercio 789', '2025-11-26 14:00:00', 'Armar PC gaming con componentes que ya tengo', 'pendiente', 'pagado', 5),
(2, 'Diego García', 'diego.garcia@email.com', '555-0108', 'Av. Central 321', '2025-11-27 09:00:00', 'PC muy lenta, necesita limpieza profunda', 'pendiente', 'pendiente', NULL),
(8, 'Laura Ramírez', 'laura.ramirez@email.com', '555-0109', 'Calle Norte 654', '2025-11-28 16:00:00', 'Laptop no enciende, posible problema de placa', 'pendiente', 'pendiente', NULL);

-- Actualizar relación bidireccional ordenes-citas
UPDATE `ordenes` SET `cita_servicio_id` = 1 WHERE `id` = 3;
UPDATE `ordenes` SET `cita_servicio_id` = 2 WHERE `id` = 5;

-- Agregar constraint para la relación bidireccional
ALTER TABLE `ordenes`
ADD CONSTRAINT `fk_orden_cita`
FOREIGN KEY (`cita_servicio_id`) REFERENCES `citas_servicios`(`id`)
ON DELETE SET NULL;



-- =====================================================
-- FINALIZACIÓN
-- =====================================================

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Script ejecutado exitosamente
-- Base de datos: nextlevel
-- Tablas creadas: 13
-- Datos insertados: Sí
-- Fecha: 2025-11-21
-- =====================================================
