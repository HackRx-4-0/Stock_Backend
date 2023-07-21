from flask import Flask
import requests
import pandas as pd
import matplotlib.pyplot as plt
from io import BytesIO
import os
from datetime import datetime, timedelta
import time

app = Flask(__name__)

# Function to fetch data from the API
def fetch_data_from_api():
    url = "https://script.google.com/macros/s/AKfycbwJcbaAOxhKrJmtdBcZIIHGm42k_7KkagkQbQLgBU3v236BZ_aijV7c6WQ2R5nkke_P8w/exec"
    response = requests.get(url)
    data = response.json()["data"]
    return data

# Function to create the "charts" directory if it doesn't exist
def create_charts_directory():
    if not os.path.exists("charts"):
        os.makedirs("charts")

# Function to convert regular datetime to UTC datetime
def convert_to_utc(dt):
    return pd.Timestamp(dt).tz_localize("UTC")

# Function to generate and save line charts locally for each stock
def generate_and_save_line_charts(data):
    stocks_data = {}
    for item in data[1:]:  # Skip the first entry, which contains column names
        symbol = item["symbol"]
        trade_date = item["trade-date"]
        close_price = float(item["close"])
        if symbol not in stocks_data:
            stocks_data[symbol] = []
        stocks_data[symbol].append((trade_date, close_price))

    # Generate and save line charts for each stock
    create_charts_directory()
    for symbol, stock_data in stocks_data.items():
        df = pd.DataFrame(stock_data, columns=["Date", "Close"])
        df["Date"] = pd.to_datetime(df["Date"])
        df.sort_values(by="Date", inplace=True)

        # Get the date for 3 months ago
        three_months_ago = datetime.now() - timedelta(days=90)

        # Filter data for the last 3 months
        three_months_ago_utc = convert_to_utc(three_months_ago)
        df = df[df["Date"] >= three_months_ago_utc]

        # Generate a line chart
        plt.figure(figsize=(12, 6))
        plt.title(f"{symbol} - Last 3 Months")
        plt.xlabel("Date")
        plt.ylabel("Closing Price")
        plt.grid(True)
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.plot(df["Date"], df["Close"], marker='o', color="blue")

        # Save the chart locally
        chart_path = f"charts/{symbol}_last_3_months_line_chart.png"
        plt.savefig(chart_path)
        plt.close()

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
