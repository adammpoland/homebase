from __future__ import division 
import time 
import RPi.GPIO as GPIO
from time import sleep

import Adafruit_PCA9685


pwm = Adafruit_PCA9685.PCA9685()
#servo_min 150 and servo_max = 600
servo_min = 150  # Min pulse length out of 4096
servo_max = 600  # Max pulse length out of 4096
straight_up = 390

def set_servo_pulse(channel, pulse):
    pulse_length = 1000000    # 1,000,000 us per second
    pulse_length //= 60       # 60 Hz
    print('{0}us per period'.format(pulse_length))
    pulse_length //= 4096     # 12 bits of resolution
    print('{0}us per bit'.format(pulse_length))
    pulse *= 1000
    pulse //= pulse_length
    pwm.set_pwm(channel, 0, pulse)

# Set frequency to 60hz, good for servos.
pwm.set_pwm_freq(60)

IRTrackingPinR = 18
IRTrackingPinC = 15
IRTrackingPinL = 14
front = 24
IRTrackingPinBall = 23

def setup():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(IRTrackingPinR, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def setup1():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(IRTrackingPinC, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def setup2():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(IRTrackingPinL, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def setup5():
	GPIO.setmode(GPIO.BCM)
	GPIO.setup(IRTrackingPinBall, GPIO.IN, pull_up_down=GPIO.PUD_UP)
def setup3():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(front, GPIO.IN, pull_up_down=GPIO.PUD_UP)

def setup4():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(21, GPIO.OUT)

#/////////////////////////////////////////////////////////////

def forward():
    pwm.set_pwm(0,0,servo_min)
    pwm.set_pwm(1,0,servo_max)
	sleep(1)

def turnRight():
	pwm.set_pwm(1,0,servo_max)
	pwm.set_pwm(0,0,servo_max)
	sleep(0.57)

def turnLeft():
    pwm.set_pwm(0,0,servo_min)
    pwm.set_pwm(1,0,servo_min)
    sleep(0.50)


    def destroy():
    pwm.set_pwm(0,0, straight_up+1)
    pwm.set_pwm(1,0, straight_up)
    sleep(2)
    GPIO.output(21, GPIO.LOW)
    GPIO.cleanup()
    #GPIO.output(21, GPIO.LOW)

def shoot():
    #shooter code goes here


def option1():
    shoot()
    forward()
    turnRight()
    forward()


setup()
setup1()
setup2()
setup3()
setup4()
setup5()



try:	
	option1()
except KeyboardInterrupt:
    destroy()