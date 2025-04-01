# Multilevel finetuning of CNNs for Diabetic Retinopathy Binary Classification

### Our code can be found at: [code](https://github.com/05kashyap/DR_Web)
### Hosted Link: [web](https://05kashyap.github.io/DR_Web/)

### Name: Aryan Kashyap Naveen, Deepak C Nayak
### Roll Number: 221AI012, 221AI016

# Frontend 
TechStack: ReactJS

The frontend is hosted on github pages. It queries the backend via the flask API. The frontend sends the image to the API through the upload button, where it is preprocessed and given to the hosted model for inference.

To run the frontend, clone the repository and then run the following command
```
npm start
```
# Backend
Techstack: Flask

The model is hosted on a local system and the endpoint is exposed to the web via a flask API through ngrok. The API ingests an image from the frontend, preprocesses it by applying appropriate transforms (for Xception model) and then runs the inference pipeline. Finally, the predictions are returned to the API.

To run the backend, clone the repository and then run the following command
```
pip install -r requirements.txt
python3 app.py
```
