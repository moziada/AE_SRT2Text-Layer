// Create a new window
var myWindow = new Window("palette", "srt to text layers");

// Create a label for the selected file
var selectedFileLabel = myWindow.add("statictext", undefined, "Select .srt File");

// Create a button that opens a file browser
var selectFileButton = myWindow.add("button", undefined, "Browse");
selectFileButton.onClick = function() {
    var textYPos = app.project.activeItem.height - (app.project.activeItem.height * 0.25);
    var textXPos = app.project.activeItem.width/2;
    var srtFile = File.openDialog("Select .srt file", "*.srt");
    if (srtFile != null) {
        // Read the file line by line
        srtFile.open("r");
        srtFile.encoding = "UTF-8";
        var startTime, endTime, text;
        var state = "number";
        while (!srtFile.eof) {
            var line = srtFile.readln();
            switch(state) {
                case "number":
                    // Skip the line containing the card number
                    state = "timecodes";
                    break;
                case "timecodes":
                    // This line contains the time codes
                    var timeCodes = line.split(" --> ");
                    startTime = timeToSeconds(timeCodes[0]);
                    endTime = timeToSeconds(timeCodes[1]);
                    state = "text";
                    break;
                case "text":
                    // This line contains the text for the layer
                    if (line === "") {
                        // The line is empty, so we're done reading the text for this card
                        // Add the text layer to the composition
                        var textLayer = app.project.activeItem.layers.addText(text);
                        textLayer.startTime = startTime;
                        textLayer.outPoint = endTime;
                        // Center the layer horizontally
                        textLayer.justification = ParagraphJustification.CENTER_JUSTIFY;
                        // Set the position of the layer
                        textLayer.position.setValue([textXPos, textYPos]);
                        //textLayer.sourcePointToComp([textXPos, textYPos]);
                        
                        state = "number";
                        text = undefined; // Reset text variable
                    } else {
                        // Add the line to the text for this card
                        if (text === undefined) {
                            text = line;
                        } else {
                            text += "\r" + line;
                        }
                    }
                    break;
            }
        }
        srtFile.close();
    }
};

// Show the window
myWindow.show();

// Function to convert a timecode string to seconds
function timeToSeconds(timecode) {
    var parts = timecode.split(":");
    var hours = parseInt(parts[0]);
    var minutes = parseInt(parts[1]);
    var seconds = parseFloat(parts[2].replace(",", "."));
    return (hours * 3600) + (minutes * 60) + seconds;
}
