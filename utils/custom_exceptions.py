import sys

class CustomException(Exception):
    def __init__(self, message: str, error_details : Exception = None):
        self.error_message = self.get_detailed_error_message(message,error_details)


    @staticmethod
    def get_detailed_error_message(message,error_details):
        _, _, exc_traceback = sys.exc_info()
        file_name = exc_traceback.tb_frame.f_code.co_filename if exc_traceback.tb_frame.f_code.co_filename else '<unknown>'
        line_no = exc_traceback.tb_lineno if exc_traceback.tb_lineno else '<unknown>'

        return f"{message} | Error : {error_details} | File : {file_name} | Line : {line_no}"

    def __str__(self):
        return self.error_message