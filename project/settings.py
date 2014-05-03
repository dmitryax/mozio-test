# Build paths inside the Mozio like this: os.path.join(BASE_DIR, ...)
import os
import socket


BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# If the host name ends with '.local', set LOCAL = True
if socket.gethostname().endswith(".local"):
    LOCAL = True
else:
    LOCAL = False

# Define general behavior variables for live host and non live host
if LOCAL:
    DEBUG = True
else:
    DEBUG = False

TEMPLATE_DEBUG = DEBUG

if LOCAL:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
else:
   DATABASES = {
    'default': {
        'NAME': 'mozio',
        'ENGINE': 'django.db.backends.mysql',
        'USER': 'mozio',
        'PASSWORD': 'mozio'
    }
  }


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '+nxms03w!5j6v#fn!9b*+7p96boy*4^rfd%p*b9ftwuk1r=71t'

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'mozio'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'project.urls'

WSGI_APPLICATION = 'project.wsgi.application'


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'
