#!/usr/bin/env python3
"""
Excel Ingestion Script for Capability Statement Platform
Reads Excel files and inserts data into MySQL database
"""

import pandas as pd
import mysql.connector
from mysql.connector import Error
import argparse
import sys
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
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

def validate_lawyers_schema(df):
    """Validate lawyers Excel schema"""
    required_columns = ['first_name', 'last_name']
    optional_columns = ['email', 'practice_group', 'title', 'bio', 'years_experience', 'source_system']
    
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in lawyers sheet: {missing}")
    
    return True

def validate_deals_schema(df):
    """Validate deals Excel schema"""
    required_columns = ['deal_name']
    optional_columns = ['client_name', 'deal_value', 'deal_currency', 'industry', 
                       'practice_group', 'deal_year', 'deal_description', 'deal_type', 'source_system']
    
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in deals sheet: {missing}")
    
    return True

def validate_awards_schema(df):
    """Validate awards Excel schema"""
    required_columns = ['award_name']
    optional_columns = ['awarding_organization', 'award_year', 'category', 
                       'practice_group', 'industry', 'description', 'source_system']
    
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in awards sheet: {missing}")
    
    return True

def ingest_lawyers(connection, df):
    """Insert lawyers from DataFrame"""
    cursor = connection.cursor()
    inserted = 0
    errors = []
    
    for index, row in df.iterrows():
        try:
            query = """
                INSERT INTO lawyers 
                (first_name, last_name, email, practice_group, title, bio, years_experience, source_system)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                str(row.get('first_name', '')).strip(),
                str(row.get('last_name', '')).strip(),
                str(row.get('email', '')).strip() if pd.notna(row.get('email')) else None,
                str(row.get('practice_group', '')).strip() if pd.notna(row.get('practice_group')) else None,
                str(row.get('title', '')).strip() if pd.notna(row.get('title')) else None,
                str(row.get('bio', '')).strip() if pd.notna(row.get('bio')) else None,
                int(row.get('years_experience', 0)) if pd.notna(row.get('years_experience')) else None,
                str(row.get('source_system', 'excel')).strip()
            )
            cursor.execute(query, values)
            inserted += 1
        except Error as e:
            errors.append(f"Row {index + 2}: {e}")
    
    connection.commit()
    cursor.close()
    return inserted, errors

def ingest_deals(connection, df):
    """Insert deals from DataFrame"""
    cursor = connection.cursor()
    inserted = 0
    errors = []
    
    for index, row in df.iterrows():
        try:
            query = """
                INSERT INTO deals 
                (deal_name, client_name, deal_value, deal_currency, industry, practice_group, 
                 deal_year, deal_description, deal_type, source_system)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                str(row.get('deal_name', '')).strip(),
                str(row.get('client_name', '')).strip() if pd.notna(row.get('client_name')) else None,
                float(row.get('deal_value', 0)) if pd.notna(row.get('deal_value')) else None,
                str(row.get('deal_currency', 'USD')).strip() if pd.notna(row.get('deal_currency')) else 'USD',
                str(row.get('industry', '')).strip() if pd.notna(row.get('industry')) else None,
                str(row.get('practice_group', '')).strip() if pd.notna(row.get('practice_group')) else None,
                int(row.get('deal_year', 0)) if pd.notna(row.get('deal_year')) else None,
                str(row.get('deal_description', '')).strip() if pd.notna(row.get('deal_description')) else None,
                str(row.get('deal_type', '')).strip() if pd.notna(row.get('deal_type')) else None,
                str(row.get('source_system', 'excel')).strip()
            )
            cursor.execute(query, values)
            inserted += 1
        except Error as e:
            errors.append(f"Row {index + 2}: {e}")
    
    connection.commit()
    cursor.close()
    return inserted, errors

def ingest_awards(connection, df):
    """Insert awards from DataFrame"""
    cursor = connection.cursor()
    inserted = 0
    errors = []
    
    for index, row in df.iterrows():
        try:
            query = """
                INSERT INTO awards 
                (award_name, awarding_organization, award_year, category, practice_group, 
                 industry, description, source_system)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                str(row.get('award_name', '')).strip(),
                str(row.get('awarding_organization', '')).strip() if pd.notna(row.get('awarding_organization')) else None,
                int(row.get('award_year', 0)) if pd.notna(row.get('award_year')) else None,
                str(row.get('category', '')).strip() if pd.notna(row.get('category')) else None,
                str(row.get('practice_group', '')).strip() if pd.notna(row.get('practice_group')) else None,
                str(row.get('industry', '')).strip() if pd.notna(row.get('industry')) else None,
                str(row.get('description', '')).strip() if pd.notna(row.get('description')) else None,
                str(row.get('source_system', 'excel')).strip()
            )
            cursor.execute(query, values)
            inserted += 1
        except Error as e:
            errors.append(f"Row {index + 2}: {e}")
    
    connection.commit()
    cursor.close()
    return inserted, errors

def main():
    parser = argparse.ArgumentParser(description='Ingest Excel data into MySQL database')
    parser.add_argument('--file', required=True, help='Path to Excel file')
    parser.add_argument('--sheet', help='Specific sheet name to ingest (optional)')
    parser.add_argument('--type', choices=['lawyers', 'deals', 'awards', 'all'], 
                       default='all', help='Type of data to ingest')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: File not found: {args.file}")
        sys.exit(1)
    
    print(f"Reading Excel file: {args.file}")
    
    try:
        # Read Excel file
        excel_file = pd.ExcelFile(args.file)
        print(f"Available sheets: {excel_file.sheet_names}")
        
        connection = get_db_connection()
        print("Connected to database successfully")
        
        results = {
            'lawyers': {'inserted': 0, 'errors': []},
            'deals': {'inserted': 0, 'errors': []},
            'awards': {'inserted': 0, 'errors': []}
        }
        
        # Process each sheet
        sheets_to_process = [args.sheet] if args.sheet else excel_file.sheet_names
        
        for sheet_name in sheets_to_process:
            if sheet_name not in excel_file.sheet_names:
                print(f"Warning: Sheet '{sheet_name}' not found, skipping")
                continue
            
            print(f"\nProcessing sheet: {sheet_name}")
            df = pd.read_excel(args.file, sheet_name=sheet_name)
            print(f"Found {len(df)} rows")
            
            # Determine data type from sheet name or type argument
            data_type = args.type
            if args.type == 'all':
                sheet_lower = sheet_name.lower()
                if 'lawyer' in sheet_lower or 'attorney' in sheet_lower:
                    data_type = 'lawyers'
                elif 'deal' in sheet_lower or 'transaction' in sheet_lower:
                    data_type = 'deals'
                elif 'award' in sheet_lower or 'recognition' in sheet_lower:
                    data_type = 'awards'
                else:
                    print(f"Warning: Could not determine data type for sheet '{sheet_name}', skipping")
                    continue
            
            # Validate and ingest
            try:
                if data_type == 'lawyers':
                    validate_lawyers_schema(df)
                    inserted, errors = ingest_lawyers(connection, df)
                    results['lawyers']['inserted'] += inserted
                    results['lawyers']['errors'].extend(errors)
                    print(f"✓ Inserted {inserted} lawyers")
                
                elif data_type == 'deals':
                    validate_deals_schema(df)
                    inserted, errors = ingest_deals(connection, df)
                    results['deals']['inserted'] += inserted
                    results['deals']['errors'].extend(errors)
                    print(f"✓ Inserted {inserted} deals")
                
                elif data_type == 'awards':
                    validate_awards_schema(df)
                    inserted, errors = ingest_awards(connection, df)
                    results['awards']['inserted'] += inserted
                    results['awards']['errors'].extend(errors)
                    print(f"✓ Inserted {inserted} awards")
            
            except ValueError as e:
                print(f"✗ Validation error: {e}")
                results[data_type]['errors'].append(str(e))
            except Error as e:
                print(f"✗ Database error: {e}")
                results[data_type]['errors'].append(str(e))
        
        connection.close()
        
        # Print summary
        print("\n" + "="*50)
        print("INGESTION SUMMARY")
        print("="*50)
        print(f"Lawyers: {results['lawyers']['inserted']} inserted")
        if results['lawyers']['errors']:
            print(f"  Errors: {len(results['lawyers']['errors'])}")
        print(f"Deals: {results['deals']['inserted']} inserted")
        if results['deals']['errors']:
            print(f"  Errors: {len(results['deals']['errors'])}")
        print(f"Awards: {results['awards']['inserted']} inserted")
        if results['awards']['errors']:
            print(f"  Errors: {len(results['awards']['errors'])}")
        
        if any(results[k]['errors'] for k in results):
            print("\nErrors encountered:")
            for data_type, result in results.items():
                for error in result['errors']:
                    print(f"  [{data_type}] {error}")
        
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
