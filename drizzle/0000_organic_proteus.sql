CREATE TABLE `escolas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lotacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`escola_id` integer NOT NULL,
	`turno_id` integer NOT NULL,
	`turma` text NOT NULL,
	`oficina_id` integer NOT NULL,
	`oficineiro_id` integer NOT NULL,
	`horas_aula` real NOT NULL,
	`horas_planejamento` real NOT NULL,
	`dias` text NOT NULL,
	FOREIGN KEY (`escola_id`) REFERENCES `escolas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`turno_id`) REFERENCES `turnos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`oficina_id`) REFERENCES `oficinas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`oficineiro_id`) REFERENCES `oficineiros`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `oficinas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `oficineiros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `turnos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL
);
