import matplotlib
matplotlib.use("Agg")  # Set non-interactive backend before importing pyplot

from flask import Flask
import requests
import pandas as pd
import matplotlib.pyplot as plt
import os
from datetime import datetime, timedelta
import time

app = Flask(__name__)

# Function to fetch data from the API
def fetch_data_from_api():
    url = "https://script.google.com/macros/s/AKfycbyIMkGzove1qxt1ogqdfeRenKmvIuLdEWFO7m5kWkEbpwJGFlhapGHgd7EDPwZObsJnwA/exec"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for 4xx and 5xx status codes
        data = response.json()["data"]
        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
    except ValueError as json_err:
        print(f"JSON decode error occurred: {json_err}")
    return None

# Function to create the "charts" directory if it doesn't exist
def create_charts_directory():
    if not os.path.exists("charts"):
        os.makedirs("charts")
    if not os.path.exists("charts/one"):
        os.makedirs("charts/one")

# Function to convert regular datetime to UTC datetime
def convert_to_utc(dt):
    return pd.Timestamp(dt).tz_localize("UTC")

# Function to generate and save line chart locally for each stock for one month
def generate_and_save_line_chart_one_month(symbol, stock_data, one_month_ago_utc):
    # Filter data for the last 1 month
    df_one_month = stock_data[stock_data["Date"] >= one_month_ago_utc]

    # Generate a line chart for 1 month
    plt.figure(figsize=(12, 6))
    plt.title(f"{symbol} - Last 1 Month")
    plt.xlabel("Date")
    plt.ylabel("Closing Price")
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.plot(df_one_month["Date"], df_one_month["Close"], color="green")

    # Save the chart locally for 1 month
    chart_path = f"charts/one/{symbol}.png"
    plt.savefig(chart_path)
    plt.close()

# Function to generate and save line charts locally for each stock for three months
def generate_and_save_line_charts(data):
    stocks_data = {}
    for item in data[1:]:  # Skip the first entry, which contains column names
        symbol = item["symbol"]
        trade_date = item["trade-date"]
        close_price = float(item["close"])
        if symbol not in stocks_data:
            stocks_data[symbol] = []
        stocks_data[symbol].append((trade_date, close_price))

    # Generate and save line charts for each stock for three months
    create_charts_directory()
    for symbol, stock_data in stocks_data.items():
        df = pd.DataFrame(stock_data, columns=["Date", "Close"])
        df["Date"] = pd.to_datetime(df["Date"])
        df.sort_values(by="Date", inplace=True)

        # Get the date for 3 months ago
        three_months_ago = datetime.now() - timedelta(days=90)
        # Get the date for 1 month ago
        one_month_ago = datetime.now() - timedelta(days=30)

        three_months_ago_utc = convert_to_utc(three_months_ago)
        df = df[df["Date"] >= three_months_ago_utc]

        # Generate a line chart for three months
        plt.figure(figsize=(12, 6))
        plt.title(f"{symbol} - Last 3 Months")
        plt.xlabel("Date")
        plt.ylabel("Closing Price")
        plt.grid(True)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.plot(df["Date"], df["Close"], color="blue")

        # Save the chart locally for three months
        chart_path = f"charts/three/{symbol}.png"
        plt.savefig(chart_path)
        plt.close()

        # Generate and save line chart for one month
        generate_and_save_line_chart_one_month(symbol, df, convert_to_utc(one_month_ago))

@app.route("/")
def index():
    start_time = time.time()  # Record the start time

    # Fetch data from the API
    data = fetch_data_from_api()

    # Generate and save line charts for each stock for the last 3 months
    generate_and_save_line_charts(data)

    end_time = time.time()  # Record the end time

    time_taken = end_time - start_time

    return f"Line charts generated and saved locally!<br>Time taken: {time_taken:.2f} seconds"

if __name__ == "__main__":
    app.run(debug=True)