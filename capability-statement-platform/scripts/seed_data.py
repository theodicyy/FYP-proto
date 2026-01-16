#!/usr/bin/env python3
"""
Data Seeding Script for Capability Statement Platform
Can be used to seed initial data or reset database
"""

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import sys

load_dotenv()

def get_db_connection():
    """Create and return MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'capability_statement_db')
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        sys.exit(1)

def seed_sample_data(connection):
    """Seed database with sample data"""
    cursor = connection.cursor()
    
    try:
        # Clear existing data (optional - be careful in production)
        print("Clearing existing data...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("TRUNCATE TABLE cap_statement_versions")
        cursor.execute("TRUNCATE TABLE cap_statements")
        cursor.execute("TRUNCATE TABLE award_lawyers")
        cursor.execute("TRUNCATE TABLE deal_lawyers")
        cursor.execute("TRUNCATE TABLE awards")
        cursor.execute("TRUNCATE TABLE deals")
        cursor.execute("TRUNCATE TABLE lawyers")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        print("✓ Cleared existing data")
        
        # Insert sample lawyers
        print("Inserting sample lawyers...")
        lawyers_data = [
            ('John', 'Smith', 'john.smith@lawfirm.com', 'Corporate Law', 'Partner', 'Expert in M&A transactions', 20, 'HRIS'),
            ('Sarah', 'Johnson', 'sarah.johnson@lawfirm.com', 'Intellectual Property', 'Senior Associate', 'Specializes in patent law', 8, 'HRIS'),
            ('Michael', 'Chen', 'michael.chen@lawfirm.com', 'Corporate Law', 'Partner', 'Leading expert in securities law', 18, 'HRIS'),
        ]
        cursor.executemany(
            """INSERT INTO lawyers (first_name, last_name, email, practice_group, title, bio, years_experience, source_system)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            lawyers_data
        )
        print(f"✓ Inserted {len(lawyers_data)} lawyers")
        
        # Insert sample deals
        print("Inserting sample deals...")
        deals_data = [
            ('TechCorp Acquisition', 'TechCorp Inc.', 500000000.00, 'USD', 'Technology', 'Corporate Law', 2023, 'Represented TechCorp in acquisition', 'M&A', 'DealTracker'),
            ('PharmaCo IPO', 'PharmaCo Ltd.', 750000000.00, 'USD', 'Healthcare', 'Corporate Law', 2023, 'Led initial public offering', 'IPO', 'DealTracker'),
        ]
        cursor.executemany(
            """INSERT INTO deals (deal_name, client_name, deal_value, deal_currency, industry, practice_group, deal_year, deal_description, deal_type, source_system)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            deals_data
        )
        print(f"✓ Inserted {len(deals_data)} deals")
        
        # Insert sample awards
        print("Inserting sample awards...")
        awards_data = [
            ('Lawyer of the Year', 'Legal Excellence Awards', 2023, 'Individual', 'Corporate Law', 'General', 'Outstanding work in corporate transactions', 'AwardsDB'),
            ('Top M&A Deal', 'M&A Magazine', 2023, 'Deal', 'Corporate Law', 'Technology', 'TechCorp Acquisition named top deal', 'AwardsDB'),
        ]
        cursor.executemany(
            """INSERT INTO awards (award_name, awarding_organization, award_year, category, practice_group, industry, description, source_system)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            awards_data
        )
        print(f"✓ Inserted {len(awards_data)} awards")
        
        connection.commit()
        print("\n✓ Sample data seeded successfully!")
        
    except Error as e:
        print(f"Error seeding data: {e}")
        connection.rollback()
        raise
    finally:
        cursor.close()

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Seed database with sample data')
    parser.add_argument('--reset', action='store_true', help='Reset database before seeding')
    args = parser.parse_args()
    
    connection = get_db_connection()
    print("Connected to database")
    
    try:
        seed_sample_data(connection)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        connection.close()

if __name__ == '__main__':
    main()
