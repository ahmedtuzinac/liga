export interface Team {
  id: number;
  name: string;
  full_name: string;
  city: string;
  players: Player[];
  player_count?: number;
}

export interface Player {
  id: number;
  name: string;
  team: number;
}

export interface SetScore {
  id: number;
  set_number: number;
  home_points: number;
  away_points: number;
}

export interface Game {
  id: number;
  game_number: number;
  home_player: number;
  away_player: number;
  home_player_name: string;
  away_player_name: string;
  home_player_2: number | null;
  away_player_2: number | null;
  home_player_2_name: string | null;
  away_player_2_name: string | null;
  home_designation: string;
  away_designation: string;
  home_sets_won: number;
  away_sets_won: number;
  is_doubles: boolean;
  sets: SetScore[];
}

export interface Match {
  id: number;
  round: number;
  home_team: number;
  away_team: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  is_completed: boolean;
  games?: Game[];
}

export interface ByeRound {
  team: number;
  team_name: string;
}

export interface Round {
  id: number;
  round_number: number;
  date: string | null;
  matches: Match[];
  match_count?: number;
  completed_count?: number;
  bye: ByeRound | null;
}

export interface PlayerDetail {
  id: number;
  name: string;
  team_name: string;
  team_full_name: string;
  team_id: number;
  played: number;
  wins: number;
  losses: number;
  win_pct: number;
  sets_won: number;
  sets_lost: number;
  games: PlayerGame[];
}

export interface PlayerGame {
  game_id: number;
  round_number: number;
  match_id: number;
  opponent_name: string;
  opponent_team: string;
  home_sets_won: number;
  away_sets_won: number;
  won: boolean;
  sets: { set_number: number; player_points: number; opponent_points: number }[];
}

export interface PlayerStanding {
  player_id: number;
  player_name: string;
  team_name: string;
  team_id: number;
  played: number;
  wins: number;
  losses: number;
  win_pct: number;
  sets_won: number;
  sets_lost: number;
}

export interface Standing {
  team_id: number;
  team_name: string;
  team_full_name: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  singles_won: number;
  singles_lost: number;
  sets_won: number;
  sets_lost: number;
}
