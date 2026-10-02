from setuptools import setup, find_packages


with open("requirements.txt") as f:
    requirements = f.read().splitlines()


setup(
    name="ANIME_RECOMMENDATION",
    version="0.0.1",
    author="Rishika",
    packages=find_packages(),
    install_requires=requirements,
)