import pandas as pd


class AnimeDataLoader:
    def __init__(self,original_csv: str, processed_csv_path:str):
        self.original_csv = original_csv
        self.processed_csv_path = processed_csv_path

    def load_and_process(self):
        df = pd.read_csv(
            self.original_csv,
            encoding="utf-8",
            on_bad_lines="skip",
        ).dropna()

        required_cols = {"Name","Genres","sypnopsis"}
        if not required_cols.issubset(df.columns):
            raise ValueError("Missing required columns: {}".format(required_cols))

        df["Combined_info"] = (
            "Title: " + df["Name"]
            + "Overview: " + df["sypnopsis"]
            + "Genres: " + df["Genres"]
        )

        df[["Combined_info"]].to_csv(
            self.processed_csv_path,
            index=False,
            encoding="utf-8",
        )

        return self.processed_csv_path