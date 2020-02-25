# Spotting toxic subreddit behaviours

## Intro

For the Information Visualisation course at UvA, we will make a visualisation of the Reddit dataset, which can be found at https://snap.stanford.edu/data/soc-RedditHyperlinks.html. This dataset contains connections between subreddits, including whether the influence is of positive or negative nature.


## General project plan
The pictured user for our visualization will be a Reddit moderator. The goal of this user is to find 'toxic' subreddits, that influence other subreddits in a negative way. Plan of action:
1. Apply the Markov clustering algorithm to the data. This results in clusters of subreddits that interact with each other.
2. In the visualization, the subreddits and their clusters are shown as a graph.
3. It will be possible to interactively zoom in on the bigger clusters. This will be possible upto a maximum of 4 to 5 times.
4. Many clusters consist of only very few subreddits. These are not intersting to investigate further, so there will not be a possibility to further explore these clusters in our visualisation.
5. On the deepest level of the graph, specific subreddits can be investigated further. This will be done by presenting different visualizations, which are not designed yet.

## Detailed project planning

| goal                    | task                                                                                                                                                                                                                                                           | deadline sprint |
|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|
| preparation             | Creating a project planning                                                                                                                                                                                                                                    | 02/25           |
| preparation             | Setting up a Github repo                                                                                                                                                                                                                                       | 02/25           |
| preparation             | Setup of SQL database containing Subreddit interactions                                                                                                                                                                                                        | 02/25           |
| MPV                     | Having a D3 frontend, including:                                                                                                                                                                                                                               | 03/03           |
|                         | - A visual representation of Subreddit clusters and their interactions                                                                                                                                                                                         |                 |
|                         | - Timeslider to select a timeframe to investigate                                                                                                                                                                                                              |                 |
|                         | - Possibility to select one or multiple Subreddit clusters to zoom in on                                                                                                                                                                                       |                 |
|                         | - Arrow in the top-left corner to go back to a higher cluster level                                                                                                                                                                                            |                 |
|                         | - Number in the top-right corner indicating the percentage of Subreddits that is currently shown                                                                                                                                                               |                 |
| MPV                     | Having a Node.js backend running, able to:                                                                                                                                                                                                                     | 03/03           |
|                         | - Filter Subreddit interactions by timespan                                                                                                                                                                                                                    |                 |
|                         | - Filter Subreddit interactions by selected Subreddits                                                                                                                                                                                                         |                 |
|                         | - Cluster Subreddit interactions to a certain level                                                                                                                                                                                                            |                 |
| MPV                     | Efficient way of communication between frontend and backend, which allows for quickly updating the presented clusters every time that the user selects a new (set of) cluster(s) or a new timeframe.                                                           | 03/03           |
| Elaborate visualization | Adding more elaborate features to the visualization. For example, on the deepest level of clusters new visualizations will be added to present more detailed information about the shown Subreddits.                                                           | 03/10           |
| Project finishing       | We will split the team during this sprint. One part of the team will user-test the product and apply improvements to the visualization based on received feedback. The other part of the team will write the project report and prepare the demo presentation. | 03/17           |

## How to run

TO-DO