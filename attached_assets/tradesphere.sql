-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               PostgreSQL 14.5, compiled by Visual C++ build 1914, 64-bit
-- Server OS:                    
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES  */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table public.admin_logs
CREATE TABLE IF NOT EXISTS "admin_logs" (
	"id" INTEGER NOT NULL DEFAULT 'nextval(''admin_logs_id_seq''::regclass)',
	"admin_id" INTEGER NOT NULL,
	"action" TEXT NOT NULL,
	"details" TEXT NOT NULL,
	"timestamp" TIMESTAMP NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);

-- Dumping data for table public.admin_logs: 0 rows
/*!40000 ALTER TABLE "admin_logs" DISABLE KEYS */;
/*!40000 ALTER TABLE "admin_logs" ENABLE KEYS */;

-- Dumping structure for table public.copy_trades
CREATE TABLE IF NOT EXISTS "copy_trades" (
	"id" INTEGER NOT NULL DEFAULT 'nextval(''copy_trades_id_seq''::regclass)',
	"follower_id" INTEGER NOT NULL,
	"trader_id" INTEGER NOT NULL,
	"active" BOOLEAN NOT NULL DEFAULT 'true'
);

-- Dumping data for table public.copy_trades: 1 rows
/*!40000 ALTER TABLE "copy_trades" DISABLE KEYS */;
INSERT IGNORE INTO "copy_trades" ("id", "follower_id", "trader_id", "active") VALUES
	(1, 1, 1, 'true');
/*!40000 ALTER TABLE "copy_trades" ENABLE KEYS */;

-- Dumping structure for table public.investments
CREATE TABLE IF NOT EXISTS "investments" (
	"id" INTEGER NOT NULL DEFAULT 'nextval(''investments_id_seq''::regclass)',
	"user_id" INTEGER NOT NULL,
	"plan_name" TEXT NOT NULL,
	"amount" NUMERIC(10,2) NOT NULL,
	"start_date" TIMESTAMP NOT NULL DEFAULT 'now()',
	"end_date" TIMESTAMP NOT NULL
);

-- Dumping data for table public.investments: 1 rows
/*!40000 ALTER TABLE "investments" DISABLE KEYS */;
INSERT IGNORE INTO "investments" ("id", "user_id", "plan_name", "amount", "start_date", "end_date") VALUES
	(1, 1, 'Conservative', 1000.00, '2025-02-25 22:32:27.83', '2025-05-25 21:32:27.802');
/*!40000 ALTER TABLE "investments" ENABLE KEYS */;

-- Dumping structure for table public.session
CREATE TABLE IF NOT EXISTS "session" (
	"sid" VARCHAR NOT NULL,
	"sess" JSON NOT NULL,
	"expire" TIMESTAMP NOT NULL,
	UNIQUE INDEX "unique_sid" ("sid")
);

-- Dumping data for table public.session: 5 rows
/*!40000 ALTER TABLE "session" DISABLE KEYS */;
INSERT IGNORE INTO "session" ("sid", "sess", "expire") VALUES
	('WlP479TrnSAg2zV168lJIPtALlvdqoR4', '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":4}}', '2025-02-26 23:50:28'),
	('4mCini4vxaY638269JdCrtHB_JuGd06l', '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-02-26 21:18:35'),
	('GpjbPOi8uJ2BThzFPA0tlNnqz-3InzqN', '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-02-26 23:59:03'),
	('BAjYYVSabbQ8BZS8cQJip04SQj3L9GWh', '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-02-26 23:38:26'),
	('xg7Rzr_uM1PCC0AdqfL5-EZ3tIZZhnPr', '{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":1}}', '2025-02-26 18:54:06');
/*!40000 ALTER TABLE "session" ENABLE KEYS */;

-- Dumping structure for table public.trades
CREATE TABLE IF NOT EXISTS "trades" (
	"id" INTEGER NOT NULL DEFAULT 'nextval(''trades_id_seq''::regclass)',
	"user_id" INTEGER NOT NULL,
	"symbol" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"amount" NUMERIC(10,2) NOT NULL,
	"price" NUMERIC(10,4) NOT NULL,
	"timestamp" TIMESTAMP NOT NULL DEFAULT 'now()'
);

-- Dumping data for table public.trades: 3 rows
/*!40000 ALTER TABLE "trades" DISABLE KEYS */;
INSERT IGNORE INTO "trades" ("id", "user_id", "symbol", "type", "amount", "price", "timestamp") VALUES
	(1, 1, 'AAPL', 'buy', 50.00, 50.0000, '2025-02-25 22:21:56.069'),
	(2, 1, 'GOOGL', 'sell', 100.00, 100.0000, '2025-02-25 22:33:54.223'),
	(3, 1, 'BTC/USD', 'buy', 10.00, 10.0000, '2025-02-26 04:29:44.9');
/*!40000 ALTER TABLE "trades" ENABLE KEYS */;

-- Dumping structure for table public.transactions
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" INTEGER NOT NULL DEFAULT 'nextval(''transactions_id_seq''::regclass)',
	"user_id" INTEGER NOT NULL,
	"type" TEXT NOT NULL,
	"amount" NUMERIC(10,2) NOT NULL,
	"status" TEXT NOT NULL,
	"timestamp" TIMESTAMP NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	"approved_by" INTEGER NULL DEFAULT NULL,
	"approved_at" TIMESTAMP NULL DEFAULT NULL
);

-- Dumping data for table public.transactions: 7 rows
/*!40000 ALTER TABLE "transactions" DISABLE KEYS */;
INSERT IGNORE INTO "transactions" ("id", "user_id", "type", "amount", "status", "timestamp", "approved_by", "approved_at") VALUES
	(6, 1, 'deposit', 1000.00, 'pending', '2025-02-26 05:43:02.032', 1, '2025-02-25 23:45:47'),
	(2, 1, 'deposit', 10000.00, 'pending', '2025-02-25 22:28:03.415', NULL, '2025-02-25 23:46:54'),
	(3, 1, 'deposit', 10000.00, 'pending', '2025-02-25 23:59:58.188', NULL, '2025-02-25 23:46:55'),
	(5, 2, 'withdrawal', 100.00, 'pending', '2025-02-26 04:13:18.906', NULL, '2025-02-25 23:46:57'),
	(7, 4, 'deposit', 1000.00, 'pending', '2025-02-26 05:50:25.146', NULL, NULL),
	(1, 1, 'deposit', 10000.00, 'completed', '2025-02-25 22:25:49.043', 1, '2025-02-25 23:45:46'),
	(4, 2, 'deposit', 100.00, 'completed', '2025-02-26 00:01:42.902', 1, '2025-02-25 23:46:56');
/*!40000 ALTER TABLE "transactions" ENABLE KEYS */;

-- Dumping structure for table public.users
CREATE TABLE IF NOT EXISTS "users" (
	"id" INTEGER NOT NULL DEFAULT 'nextval(''users_id_seq''::regclass)',
	"username" VARCHAR(50) NOT NULL,
	"password" TEXT NOT NULL,
	"balance" NUMERIC NULL DEFAULT '0',
	"is_admin" BOOLEAN NULL DEFAULT 'false',
	"role" VARCHAR(20) NULL DEFAULT 'user',
	"is_verified" BOOLEAN NULL DEFAULT 'false',
	PRIMARY KEY ("id"),
	UNIQUE INDEX "users_username_key" ("username"),
	UNIQUE INDEX "unique_username" ("username")
);

-- Dumping data for table public.users: 4 rows
/*!40000 ALTER TABLE "users" DISABLE KEYS */;
INSERT IGNORE INTO "users" ("id", "username", "password", "balance", "is_admin", "role", "is_verified") VALUES
	(1, 'admin', 'cc1bfc524d75bc935a33dd6758869a9f430258ab36d33e8a800e1c888abd822cc3ae977e4a3f211ecf46d821e09ca401a2bb54c2a2def7b02af94a90c5341f63.9f86d43fa7411954a26391705c87155a', -100, 'true', 'admin', 'true'),
	(2, 'simple', 'd04f28202b6b4e40c7280c8f32126382b6bb48b265d04bbb1ce57146cbc755775f1562323391b945cf2eb4a7822315aca99646187538e668c004562a95ef9484.68b276baffebea058f74e905e69b240e', 20000, 'false', 'user', 'false'),
	(3, 'simplee', 'ffe173f94bd02dde472a697d2202161fb616cbe9fc4ebb75a9df2face2d922427886d0708335aedd18d570cd59c65ba513d5bbf02f61e561a32cd3f19ea23d32.7ded5ebf435f5799b5d44a4f1f634510', 0, 'false', 'user', 'false'),
	(4, 'simpleee', 'c07ac143c9aa1475c3b508a5aa443f8c312bde6594e1895b559bbce45911208cd79b8bf982db7ba345272a3f73645a27d9412fbca44a0d4f6aa258c14418f651.134de8002041ba6c9f44a30cfc3b7d79', 0, 'false', 'user', 'true');
/*!40000 ALTER TABLE "users" ENABLE KEYS */;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
