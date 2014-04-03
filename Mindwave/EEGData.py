from bottle import route, run
import time

# from consider import Consider
# con = Consider()

attention = 0
meditation = 0
start_time = int(time.time())
@route('/ESenseData.json')
def ESenseData():
	from bottle import response, request
	from json import dumps
	global attention
	global meditation
	response.content_type = 'application/json'

	#packet = con.get_packet()
	callback = request.query['callback']
	fps = request.query['fps']
	EsenseDataCSV(fps)
	attention += 1
	meditation += 1
	if attention > 100:
		attention = 0
	if meditation > 100:
		meditation = 0

	return ( callback + '({attention: ' + str(attention) + ', meditation: ' + str(meditation) + '})')

def EsenseDataCSV(fps):
	epoch_time = int(time.time())
	with open('fps.csv', 'a') as file:
		file.write(str(epoch_time - start_time) + ',' + str(fps) + '\n')

	return ()

run(host='localhost', port=8080, debug=True)