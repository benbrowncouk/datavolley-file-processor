/**
 * Parse the given file contents and return a JSON representation of the data.
 *
 * @param  {String} fileContents
 * @return {JSON}
 */
module.exports = {
    parseFile: function (fileContents) {

        var data = {
            matchData: {
                matchDate: null,
                matchTime: null,
                tournamentName: null,
                matchNumber: null,
                setScores: []
            },
            homeTeam: null,
            awayTeam: null
        };

        var splitLine = function (line) {
            return line.split(";")
        };

        var isPlayerRow = function (playerData) {
            return playerData.length == 18 && (playerData[0] == '0') || (playerData[0] == '1');
        };

        var processPlayer = function (playerData) {
            return {
                number: playerData[1],
                code: playerData[8],
                surname: playerData[9],
                firstname: playerData[10],
                statistics: {
                    serve: {
                        continuations: 0,
                        points: 0,
                        errors: 0
                    },
                    attacks: {
                        continuations: 0,
                        points: 0,
                        errors: 0
                    },
                    passing: {
                        continuations: 0,
                        excellent: 0,
                        errors: 0
                    },
                    block: {
                        points: 0
                    }
                }

            };
        };

        var processTeam = function (teamData) {
            return {
                teamCode: teamData[0],
                teamName: teamData[1],
                headCoach: teamData[3],
                assistantCoach: teamData[4],
                players: [],
                findPlayerByNumber: function (number) {
                    for (var i = 0; i < this.players.length; i++) {
                        if (this.players[i].number == number) {
                            return this.players[i];
                        }
                    }
                    return null;
                },
                allocateAttackSuccess: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.attacks.points += 1;
                    }
                },
                allocateAttackFault: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.attacks.errors += 1;
                    }
                },
                allocateAttackAttempt: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.attacks.continuations += 1;
                    }
                },
                allocateExcellentReception: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.passing.excellent += 1;
                    }
                },
                allocateReceptionFault: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.passing.errors += 1;
                    }
                },
                allocateReceptionAttempt: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.passing.continuations += 1;
                    }
                },
                allocateServeAce: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.serve.points += 1;
                    }
                },
                allocateServeFault: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.serve.errors += 1;
                    }
                },
                allocateServeAttempt: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.serve.continuations += 1;
                    }
                },
                allocateBlockKill: function (number) {
                    var player = this.findPlayerByNumber(number);
                    if (player != null) {
                        player.statistics.block.points += 1;
                    }
                }
            };
        };

        var processSetScore = function (setScores) {
            var i;
            var finalScore = setScores[4].split('-');
            for (i = 0; i < setScores.length; i++) {
                setScores[i] = setScores[i].trim();
            }

            return {
                scores: [setScores[1], setScores[2], setScores[3], setScores[4]],
                finalScore: finalScore,
                time: setScores[5]
            };
        };

        var parseStatsData = function (statsData, data) {
            if (statsData.substring(1, 2) == 'P') {
                //Setter number
                console.log("Setter Number: " + statsData);
            } else if (statsData.substring(1, 2) == 'p') {
                //Point
                console.log("Point: " + statsData);
            } else if (statsData.substring(1, 2) == 'z') {
                //Setter position
                console.log("Setter Position: " + statsData);
            } else if (statsData.substring(1, 2) == '$') {
                //Random codes
                console.log("Random Codes: " + statsData);
            } else {
                //Actual stats!!
                var homeTeam = statsData.substring(0, 1) == '*';
                var playerNumber = parseInt(statsData.substring(1, 3), 10);
                var skill = statsData.substring(3, 4);
                var outcome = statsData.substring(5, 6);

                if (skill == 'A') {
                    //Attack
                    if (outcome == '#') {
                        //Attack Success
                        console.log("Attack Success: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateAttackSuccess(playerNumber);
                        } else {
                            data.awayTeam.allocateAttackSuccess(playerNumber);
                        }
                    } else if (outcome == '=') {
                        //Attack Success
                        console.log("Attack Fault: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateAttackFault(playerNumber);
                        } else {
                            data.awayTeam.allocateAttackFault(playerNumber);
                        }
                    } else {
                        //Attack Continuation
                        console.log("Attack Continuation: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateAttackAttempt(playerNumber);
                        } else {
                            data.awayTeam.allocateAttackAttempt(playerNumber);
                        }
                    }
                } else if (skill == 'R') {
                    //Reception
                    if (outcome == '#') {
                        //Excellent Reception
                        console.log("Excellent Reception: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateExcellentReception(playerNumber);
                        } else {
                            data.awayTeam.allocateExcellentReception(playerNumber);
                        }
                    } else if (outcome == '=') {
                        //Reception Error
                        console.log("Reception Fault: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateReceptionFault(playerNumber);
                        } else {
                            data.awayTeam.allocateReceptionFault(playerNumber);
                        }
                    } else {
                        //Reception Attempt
                        console.log("Reception Attempt: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateReceptionAttempt(playerNumber);
                        } else {
                            data.awayTeam.allocateReceptionAttempt(playerNumber);
                        }
                    }
                } else if (skill == 'S') {
                    //Serve
                    if (outcome == '#') {
                        //Serve Ace
                        console.log("Serve Ace: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateServeAce(playerNumber);
                        } else {
                            data.awayTeam.allocateServeAce(playerNumber);
                        }
                    } else if (outcome == '=') {
                        //Serve Error
                        console.log("Serve Fault: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateServeFault(playerNumber);
                        } else {
                            data.awayTeam.allocateServeFault(playerNumber);
                        }
                    } else {
                        //Serve Attempt
                        console.log("Serve Attempt: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateServeAttempt(playerNumber);
                        } else {
                            data.awayTeam.allocateServeAttempt(playerNumber);
                        }
                    }
                } else if (skill == 'B' || skill == 'U') {
                    //Block
                    if (outcome == '#') {
                        //Block Kill
                        console.log("Block Kill: " + statsData);
                        if (homeTeam) {
                            data.homeTeam.allocateBlockKill(playerNumber);
                        } else {
                            data.awayTeam.allocateBlockKill(playerNumber);
                        }
                    }
                }
            }
        };

        var lines = fileContents.split('\n');
        for (var line = 0; line < lines.length; line++) {
            if (lines[line].indexOf(("[3MATCH]")) > -1) {
                var match_details = splitLine(lines[line + 1]);
                data.matchData.matchDate = match_details[0];
                data.matchData.matchTime = match_details[1];
                data.matchData.tournamentName = match_details[3];
                data.matchData.matchNumber = match_details[7];
                line += 1;
            } else if (lines[line].indexOf(("[3TEAMS]")) > -1) {
                data.homeTeam = processTeam(splitLine(lines[line + 1]));
                data.awayTeam = processTeam(splitLine(lines[line + 2]));
                line += 2;
            }
            else if (lines[line].indexOf(("[3COMMENTS]")) > -1) {
                line += 1;
            } else if (lines[line].indexOf(("[3SET]")) > -1) {
                var i = line + 1;
                while (lines[i].charAt(0) != '[') {
                    data.matchData.setScores.push(processSetScore(splitLine(lines[i])));
                    i++;
                }
                line = i;
            } else if (lines[line].indexOf(("[3PLAYERS-H]")) > -1) {
                while (isPlayerRow(splitLine(lines[line + 1]))) {
                    data.homeTeam.players.push(processPlayer(splitLine(lines[line + 1])));
                    line += 1
                }
            } else if (lines[line].indexOf(("[3PLAYERS-V]")) > -1) {
                while (isPlayerRow(splitLine(lines[line + 1]))) {
                    data.awayTeam.players.push(processPlayer(splitLine(lines[line + 1])));
                    line += 1
                }
            } else if (lines[line].indexOf(("[3SCOUT]")) > -1) {
                for (var j = line + 1; j < lines.length; j++) {
                    var scoutData = splitLine(lines[j]);
                    parseStatsData(scoutData[0], data);
                    line = j;
                }
            } else {
                //do nothing
            }
        }
        return data;
    }
};

