package com.carbon.trade;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDB {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

        System.out.println("Connecting to Database...");
        try (Connection conn = DriverManager.getConnection(url, "neondb_owner", "npg_zie8fp2IGWkO");
                Statement stmt = conn.createStatement()) {

            System.out.println("Fixing listings id sequence...");
            stmt.execute("CREATE SEQUENCE IF NOT EXISTS listings_id_seq");
            stmt.execute("ALTER TABLE listings ALTER COLUMN id SET DEFAULT nextval('listings_id_seq')");
            stmt.execute("ALTER SEQUENCE listings_id_seq OWNED BY listings.id");

            System.out.println("Fixing trades id sequence...");
            stmt.execute("CREATE SEQUENCE IF NOT EXISTS trades_id_seq");
            stmt.execute("ALTER TABLE trades ALTER COLUMN id SET DEFAULT nextval('trades_id_seq')");
            stmt.execute("ALTER SEQUENCE trades_id_seq OWNED BY trades.id");

            System.out.println("Database sequence setup complete.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
