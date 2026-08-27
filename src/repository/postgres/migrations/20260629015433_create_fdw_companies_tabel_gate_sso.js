/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};

/**
 
query manual:
jika ada pembaruan gate_sso_customers maka yg di hapus cukup gate_sso_customers saja:
DROP FOREIGN TABLE IF EXISTS gate_sso_companies;

ini untuk menghapus user mapping dan server jika sudah tidak digunakan lagi:
DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER gate_sso_server;
DROP SERVER IF EXISTS gate_sso_server CASCADE;

CREATE EXTENSION IF NOT EXISTS postgres_fdw;

CREATE SERVER IF NOT EXISTS gate_sso_server
    FOREIGN DATA WRAPPER postgres_fdw
    OPTIONS (host 'localhost', port '5432', dbname 'gate_sso');


CREATE USER MAPPING IF NOT EXISTS FOR CURRENT_USER
    SERVER gate_sso_server
    OPTIONS (user 'msiserver', password 'Rubysa179596!');


CREATE FOREIGN TABLE IF NOT EXISTS gate_sso_companies (
      company_id uuid,
      company_name varchar(255),
      created_at timestamp,
      created_by uuid,
      updated_at timestamp,
      updated_by uuid,
      deleted_at timestamp,
      deleted_by uuid,
      is_delete boolean
    )
    SERVER gate_sso_server
    OPTIONS (schema_name 'public', table_name 'companies');
 */