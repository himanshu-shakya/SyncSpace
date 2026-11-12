package com.syncspace.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrlEnv;

    @Value("${spring.datasource.url}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:neondb_owner}")
    private String springDatasourceUsername;

    @Value("${spring.datasource.password:npg_MK1Ncmk0deRE}")
    private String springDatasourcePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = (databaseUrlEnv != null && !databaseUrlEnv.isBlank()) 
                ? databaseUrlEnv 
                : springDatasourceUrl;

        HikariConfig config = new HikariConfig();

        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                // Parse standard URL: postgresql://user:password@host:port/database?params
                URI uri = URI.create(dbUrl.replace("postgresql://", "http://").replace("postgres://", "http://"));
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath(); // e.g. /neondb

                String userInfo = uri.getUserInfo();
                String username = springDatasourceUsername;
                String password = springDatasourcePassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + "?sslmode=require";

                log.info("Configuring Neon PostgreSQL connection to {}:{}{}", host, port, path);
                config.setJdbcUrl(jdbcUrl);
                config.setUsername(username);
                config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");
            } catch (Exception e) {
                log.warn("Could not parse DATABASE_URL as URI ({}), using spring.datasource.url", e.getMessage());
                config.setJdbcUrl(springDatasourceUrl);
                config.setUsername(springDatasourceUsername);
                config.setPassword(springDatasourcePassword);
                config.setDriverClassName("org.postgresql.Driver");
            }
        } else {
            log.info("Using configured datasource URL: {}", springDatasourceUrl);
            config.setJdbcUrl(springDatasourceUrl);
            config.setUsername(springDatasourceUsername);
            config.setPassword(springDatasourcePassword);
            if (springDatasourceUrl != null && springDatasourceUrl.contains("h2")) {
                config.setDriverClassName("org.h2.Driver");
            } else {
                config.setDriverClassName("org.postgresql.Driver");
            }
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(30000);
        config.setMaxLifetime(600000);

        return new HikariDataSource(config);
    }
}

