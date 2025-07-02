-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-07-2025 a las 22:32:14
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `email_app`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `emails`
--

CREATE TABLE `emails` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `scheduled_for` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `emails`
--

INSERT INTO `emails` (`id`, `user_id`, `recipient`, `subject`, `message`, `attachment`, `scheduled_for`, `created_at`) VALUES
(1, NULL, 'test@example.com', 'Test Email', 'This is a test email message.', NULL, NULL, '2025-06-13 04:58:18'),
(2, NULL, 'senderemail565@gmail.com', 'Correo de prueba', '¡Este es un correo real enviado desde mi app!', NULL, NULL, '2025-06-13 05:18:10'),
(3, NULL, 'tucorreo@gmail.com', 'Correo protegido', 'Este correo fue enviado por un usuario autenticado.', NULL, NULL, '2025-06-13 05:38:55'),
(4, NULL, 'senderemail565@gmail.com', 'Correo protegido', 'Este correo fue enviado por un usuario autenticado.', NULL, NULL, '2025-06-13 05:39:37'),
(5, 1, 'tucorreo@gmail.com', 'Correo nuevo autenticado', 'Este correo debe aparecer en el historial.', NULL, NULL, '2025-06-14 01:02:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `password_reset_token`, `password_reset_expires`) VALUES
(1, 'Santiago', 'santiago@example.com', '$2b$10$De3jCd3bdLUcwQ6baT9x9OYc9VtztYSAaKYNwi.QneSM3XJwWScbW', '2025-06-13 05:28:32', NULL, NULL),
(2, '', 'quintiagogarciadev@gmail.com', '$2b$12$WdfhDFumw2rEaRVeqXH7FOavTlg7b7n8buFe55etlYO3zVpGY2ZwC', '2025-06-14 23:31:14', NULL, NULL),
(3, '', 'santiago@gmail.com', '$2b$10$T6d0p6JcC/GvWzkx/TCoJ.3sKX.eMjqpTmmEwvdzLOOX5bTOMmwsq', '2025-06-14 23:33:23', NULL, NULL),
(4, '', 'user@example.com', '$2b$10$hwfItd/a.0gQJ1AAETKpmOjkpXOYhyzpo6PNAbRuV1/JngWqN.hoW', '2025-06-26 03:14:15', NULL, NULL),
(7, '', 'test@example.com', '$2b$10$0cCg/rANZ/iPs2CTFh6A5.2s9sMgKM3gv6p6tGsDA01rW2iYBdW1q', '2025-06-26 05:14:09', NULL, NULL),
(8, '', 'usuario@example.com', '$2b$10$SIPkO3MrI3bA.tCI9lLdTOmlOU6Aw7pa8LfjRTwNzwoISyoofpp0y', '2025-06-26 05:23:00', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `emails`
--
ALTER TABLE `emails`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_password_reset_token` (`password_reset_token`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `emails`
--
ALTER TABLE `emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
