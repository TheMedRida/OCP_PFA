import joblib
import numpy as np
import onnxmltools
from skl2onnx import convert_sklearn
from onnxmltools import convert_lightgbm
from onnxmltools.convert.common.data_types import FloatTensorType
import lightgbm as lgb


# ---------------- for sklearn model ------------------------

# Load your trained model
model = joblib.load('./best_models/Tuning_LightGBM.pkl')

# Define input type (94 features)
#initial_type = [('float_input', FloatTensorType([None, 93]))]

#-------------------------------------------------------------

# ============= Convert to ONNX for sklearn model ================
#onnx_model = convert_sklearn(model, initial_types=initial_type)
#=================================================================

# Convert to ONNX for LightGBM model
#⚡ Note: If you trained the LightGBM model via lightgbm.train(), you need to load it differently and convert with onnxmltools.
#If you trained it via LGBMClassifier or LGBMRegressor from sklearn API, then it works with convert_lightgbm.
# onnx_model = convert_lightgbm(model, initial_types=initial_type)


# Define input type (94 features)
initial_type = [('float_input', FloatTensorType([None, 93]))]

# Convert model
onnx_model = onnxmltools.convert_lightgbm( model , initial_types=initial_type)

# Save the ONNX model
with open('./onnx_models/LightGBM_Tmodel.onnx', 'wb') as f:
    f.write(onnx_model.SerializeToString())

print("✅ Model converted to ONNX format")





