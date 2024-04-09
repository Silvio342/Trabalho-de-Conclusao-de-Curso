-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 09-Abr-2024 às 18:25
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `chat`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `messages`
--

CREATE TABLE `messages` (
  `pk_message_id` int(11) NOT NULL,
  `fk_sender_id` int(11) NOT NULL,
  `fk_reciever_id` int(11) NOT NULL,
  `sending_data` timestamp NOT NULL DEFAULT current_timestamp(),
  `msg` text DEFAULT NULL,
  `msg_language` varchar(2) NOT NULL DEFAULT 'PT'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `pk_user_id` int(11) NOT NULL,
  `username` varchar(12) NOT NULL,
  `name` varchar(32) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `language` varchar(2) NOT NULL,
  `registrydate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`pk_message_id`),
  ADD KEY `fk_sender_id` (`fk_sender_id`),
  ADD KEY `fk_reciever_id` (`fk_reciever_id`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`pk_user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `messages`
--
ALTER TABLE `messages`
  MODIFY `pk_message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=122;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `pk_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`fk_sender_id`) REFERENCES `users` (`pk_user_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`fk_reciever_id`) REFERENCES `users` (`pk_user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
