from flask import Flask, render_template, request, redirect, url_for
from rembg import remove
from pymongo import MongoClient
import numpy as np
import cv2
import os
import datetime

app = Flask(__name__)
UPLOAD_FOLDER = 'static'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

client = MongoClient("mongodb://localhost:27017/")  
db = client['background_remover']
gallery_col = db['gallery']

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        file = request.files['image']
        input_path = os.path.join(UPLOAD_FOLDER, 'input.png')
        output_filename = f"output_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        output_path = os.path.join(UPLOAD_FOLDER, output_filename)
        file.save(input_path)

        # Remove background
        image = cv2.imread(input_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = remove(image)
        result = cv2.cvtColor(np.array(result), cv2.COLOR_RGB2BGRA)
        cv2.imwrite(output_path, result)

        # Save to MongoDB
        gallery_col.insert_one({
            'filename': output_filename,
            'timestamp': datetime.datetime.now()
        })

        return render_template('index.html', filename=output_filename)

    return render_template('index.html', filename=None)

@app.route('/gallery')
def gallery():
    images = list(gallery_col.find().sort('timestamp', -1))
    return render_template('gallery.html', images=images)

if __name__ == '__main__':
    app.run(debug=True)
