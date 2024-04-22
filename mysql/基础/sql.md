# sql

## sql 通用语句

## sql 分类

### DDL

Data Definition Language 数据定义语言，用来定义数据库对象（数据库，表，字段）

常见的 DDL 语句包括以下几种：

CREATE：用于创建数据库对象，如创建数据库、创建表、创建视图等。例如：
创建数据库：CREATE DATABASE database_name;
创建表：CREATE TABLE table_name (column1 datatype, column2 datatype, ...);
创建视图：CREATE VIEW view_name AS SELECT column1, column2, ... FROM table_name;

ALTER：用于修改数据库对象的结构，如修改表结构、添加/删除列、修改约束等。例如：
修改表名称：ALTER TABLE table_name RENAME TO new_table_name;
添加列：ALTER TABLE table_name ADD column_name datatype;
修改列的数据类型：ALTER TABLE table_name ALTER COLUMN column_name TYPE new_datatype;

DROP：用于删除数据库对象，如删除数据库、删除表、删除视图等。例如：
删除数据库：DROP DATABASE database_name;
删除表：DROP TABLE table_name;
删除视图：DROP VIEW view_name;
TRUNCATE：用于删除表中的所有数据（表结构保持不变）。例如：

清空表数据：TRUNCATE TABLE table_name;
COMMENT：用于添加注释或说明信息到数据库对象中。例如：

添加表注释：COMMENT ON TABLE table_name IS 'Table description';
添加列注释：COMMENT ON COLUMN table_name.column_name IS 'Column description';

### DML

Data Manipulation Language 数据操作语言，用来对数据表中的数据进行增删改

常见的 DML 语句包括以下几种：

INSERT：用于向表中插入数据。例如：
插入单行数据：INSERT INTO table_name (column1, column2) VALUES (value1, value2);
插入多行数据：INSERT INTO table_name (column1, column2) VALUES (value1, value2), (value3, value4);

UPDATE：用于更新表中的数据。例如：
更新单条记录：UPDATE table_name SET column1 = value1, column2 = value2 WHERE condition;
批量更新记录：UPDATE table_name SET column = value WHERE condition;

DELETE：用于删除表中的数据。例如：
删除单条记录：DELETE FROM table_name WHERE condition;
删除所有记录：DELETE FROM table_name;

### DQL

Data Query Language 数据查询语言，用来查询数据库表中的记录

### DCL

Data Control Language 数据控制语言，用来创建数据库用户，控制数据库的访问权限

以下是一些常见的 DCL 语句：

GRANT：用于授权用户或角色访问数据库对象的权限。例如：
授予 SELECT 权限给用户：GRANT SELECT ON table_name TO user_name;
授予 INSERT、UPDATE、DELETE 权限给角色：GRANT INSERT, UPDATE, DELETE ON table_name TO role_name;

REVOKE：用于撤销用户或角色的权限。例如：
撤销用户的 SELECT 权限：REVOKE SELECT ON table_name FROM user_name;
撤销角色的 INSERT、UPDATE、DELETE 权限：REVOKE INSERT, UPDATE, DELETE ON table_name FROM role_name;

CREATE USER：用于创建新的数据库用户。例如：
创建用户并指定密码：CREATE USER user_name WITH PASSWORD 'password';

ALTER USER：用于修改数据库用户的属性，如更改密码。例如：
修改用户密码：ALTER USER user_name WITH PASSWORD 'new_password';

DROP USER：用于删除数据库用户。例如：
删除用户：DROP USER user_name;
