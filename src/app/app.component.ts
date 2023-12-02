import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatIconModule} from '@angular/material/icon';

import { Chart } from 'chart.js/auto';

type AirplaneWBRevision = {
  "Tail" : string,
  "Date" : string,
  "Make" : string,
  "Model" : string,
  "Weight" : number,
  "Arm" : number,
  "Moment" : number,
  "UsefulLoad" : number,
  "PDF" : string,
};

type WBrow = {
  "Weight" : number,
  "Arm" : number,
  "Moment" : number,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatInputModule, MatSelectModule, MatFormFieldModule, MatGridListModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  public chart:any = [];

  createChart() {
    this.chart = new Chart("WeightAndBalanceChart", {
      type: 'scatter', //this denotes tha type of chart

      data: {// values on X-Axis
	       datasets: [
          {
            label: 'Envelope',
            data: [
              {x:82,y:1200},
              {x:93,y:1200},
              {x:93,y:2550},
              {x:88.4,y:2550},
              {x:82,y:2050},
              {x:82,y:1200},
            ],
            showLine: true,
          },
          { // takeoff
            label: 'TO W&B',
            data: [],
          },
          { // landing
            label: 'LDG W&B',
            data: [],
          },
        ]
      },
      options: {
        responsive: true,
        aspectRatio:1,
        plugins: {
          title: {
            display: false,
            text: 'Weight vs CG Envelope'
          },
          subtitle: {
            display: true,
            text: '2550 Lbs Max Gross Wt'
          }

        },
        scales: {
          x: {
            display: true,
            title: {
              text: 'CG Location (Inches Aft Datum)',
              display: true,
              font: {
                family: 'Times',
                size: 20,
                style: 'normal',
                lineHeight: 1.2
              },
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Airplane Weight Lbs',
              font: {
                family: 'Times',
                size: 20,
                style: 'normal',
                lineHeight: 1.2
              },
              
            }
          }

        }
      }
      
    });
  }
  
  
  ngOnInit(): void {
    this.createChart();
    this.chart.update();
  }
  
  
  updateWB($event:any, rowName:string ) {

    switch( rowName ) {
      case("frontSeatWB"): {
        this.frontSeatWB.Weight = Number($event.target.value);
        this.frontSeatWB.Moment = this.frontSeatWB.Weight * this.frontSeatWB.Arm;
        break;
      }
      case("rearSeatWB") :{
        this.rearSeatWB.Weight = Number($event.target.value);
        this.rearSeatWB.Moment = this.rearSeatWB.Weight * this.rearSeatWB.Arm;
        break;
      }
      case("fuelWB") :{
        this.fuelWB.Weight = Number($event.target.value);
        this.fuelWB.Moment = this.fuelWB.Weight * this.fuelWB.Arm;
        break;
      }
      case("fuelBurnWB") :{
        this.fuelBurnWB.Weight = Number($event.target.value);
        this.fuelBurnWB.Moment = this.fuelBurnWB.Weight * this.fuelBurnWB.Arm;
        break;
      }
    }

    this.rampWeightWB.Weight = this.airplane.Weight + this.frontSeatWB.Weight + this.rearSeatWB.Weight + this.fuelWB.Weight;
    this.rampWeightWB.Moment =  Number((this.airplane.Moment + this.frontSeatWB.Moment + this.rearSeatWB.Moment + this.fuelWB.Moment).toFixed(3));
    this.rampWeightWB.Arm = Number((this.rampWeightWB.Moment / this.rampWeightWB.Weight).toFixed(3));

    // use + because values are already negative
    this.takeoffWB.Weight = Number((this.rampWeightWB.Weight + this.fuelAllowanceWB.Weight).toFixed(3));
    this.takeoffWB.Moment = Number((this.rampWeightWB.Moment + this.fuelAllowanceWB.Moment).toFixed(3));
    this.takeoffWB.Arm = Number((this.takeoffWB.Moment / this.takeoffWB.Weight).toFixed(3));

    this.landingWB.Weight = Number(( this.takeoffWB.Weight + this.fuelBurnWB.Weight).toFixed(3));
    this.landingWB.Moment = Number((this.takeoffWB.Moment + this.fuelBurnWB.Moment).toFixed(3));
    this.landingWB.Arm = Number((this.landingWB.Moment / this.landingWB.Weight).toFixed(3));

    this.chart.data.datasets[1].data[0] = {x:this.takeoffWB.Arm, y:this.takeoffWB.Weight}; // update chart for new WB
    this.chart.data.datasets[2].data[0] = {x:this.landingWB.Arm, y:this.landingWB.Weight}; // update chart for new WB
    this.chart.update();

  }

  title = 'weight-and-balance';

  airplane: AirplaneWBRevision;
  airplanes: AirplaneWBRevision[];

  basicEmptyWB: WBrow;
  frontSeatWB: WBrow;
  rearSeatWB: WBrow;
  fuelWB: WBrow;
  rampWeightWB: WBrow;
  fuelAllowanceWB: WBrow;
  takeoffWB: WBrow;
  fuelBurnWB: WBrow;
  landingWB: WBrow;

  airplaneSelected($event: string) {
    console.log($event)

    const findAirplane =  this.airplanes.find( (a) => a!.Tail === $event );

    if ( findAirplane != undefined )
    {
      this.airplane = findAirplane;
    
    } else {
      this.airplane = {

        "Tail" : "",
        "Date" : "",
        "Make" : "",
        "Model" : "",
        "Weight" : 0,
        "Arm" : 0,
        "Moment" : 0,
        "UsefulLoad" : 0,
        "PDF" : "",
  
      };
    }

    this.updateWB(null, "airplaneSelected");
    // console.log( this.airplane?.Tail);
  }

  constructor( ) {

    this.basicEmptyWB= {
      "Weight" : 0,
      "Arm" : 0,
      "Moment" : 0,
    };
    this.frontSeatWB= {
      "Weight" : 0,
      "Arm" : 80.5,
      "Moment" : 0,
    };
    this.rearSeatWB= {
      "Weight" : 0,
      "Arm" : 118.1,
      "Moment" : 0,
    };
    this.fuelWB= {
      "Weight" : 0,
      "Arm" : 95.0,
      "Moment" : 0,
    };
    this.rampWeightWB= {
      "Weight" : 0,
      "Arm" : 0,
      "Moment" : 0,
    };
    this.fuelAllowanceWB= {
      "Weight" : -8,
      "Arm" : 95.0,
      "Moment" : -760,
    };
    this.takeoffWB= {
      "Weight" : 0,
      "Arm" : 0,
      "Moment" : 0,
    };

    this.fuelBurnWB= {
      "Weight" : 0,
      "Arm" : 95.0,
      "Moment" : 0,
    };

    this.landingWB= {
      "Weight" : 0,
      "Arm" : 0,
      "Moment" : 0,
    };

    this.airplane = {

      "Tail" : "",
      "Date" : "",
      "Make" : "",
      "Model" : "",
      "Weight" : 0,
      "Arm" : 0,
      "Moment" : 0,
      "UsefulLoad" : 0,
      "PDF" : "",

    };

    this.airplanes = [
      {
        "Tail" : "N256FA",
        "Date" : "08/15/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1603.3,
        "Arm" : 87.14,
        "Moment" : 139715.54,
        "UsefulLoad" : 954.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N256FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N257FA",
        "Date" : "05/12/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1604.3,
        "Arm" : 87.01,
        "Moment" : 139588.14,
        "UsefulLoad" : 953.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N257FA-WB-05-12-2022.pdf"
      },
      {
        "Tail" : "N275FA",
        "Date" : "04/21/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1604.3,
        "Arm" : 86.86,
        "Moment" : 139352.04,
        "UsefulLoad" : 953.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N275FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N359FA",
        "Date" : "06/06/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1606.3,
        "Arm" : 87.43,
        "Moment" : 140437.14,
        "UsefulLoad" : 951.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N359FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N360FA",
        "Date" : "08/02/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1605.3,
        "Arm" : 87.22,
        "Moment" : 140012.64,
        "UsefulLoad" : 952.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N360FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N461FA",
        "Date" : "03/15/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1606.2,
        "Arm" : 86.9063,
        "Moment" : 139586.3,
        "UsefulLoad" : 951.8,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N461FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N462FA",
        "Date" : "04/04/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1607.3,
        "Arm" : 87.247,
        "Moment" : 140232.04,
        "UsefulLoad" : 950.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N462FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N463FA",
        "Date" : "06/28/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1609.3,
        "Arm" : 86.93,
        "Moment" : 139900.54,
        "UsefulLoad" : 948.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N463FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N464FA",
        "Date" : "04/08/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1603.2,
        "Arm" : 87.1582,
        "Moment" : 139729.4,
        "UsefulLoad" : 954.8,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N464FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N465FA",
        "Date" : "10/12/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1604.3,
        "Arm" : 87.2540,
        "Moment" : 139981.64,
        "UsefulLoad" : 953.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N465FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N466FA",
        "Date" : "07/21/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1604.3,
        "Arm" : 87.16,
        "Moment" : 139824.24,
        "UsefulLoad" : 953.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N466FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N467FA",
        "Date" : "10/05/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1604.3,
        "Arm" : 86.96,
        "Moment" : 139509.44,
        "UsefulLoad" : 953.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N467FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N468FA",
        "Date" : "10/21/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1605.3,
        "Arm" : 87.22,
        "Moment" : 140012.64,
        "UsefulLoad" : 952.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N468FA-Weight-and-Balance.pdf"
      },
      {
        "Tail" : "N469FA",
        "Date" : "10/06/2022",
        "Make" : "Piper",
        "Model" : "PA-28-181",
        "Weight" : 1606.3,
        "Arm" : 86.8713,
        "Moment" : 139541.44,
        "UsefulLoad" : 951.7,
        "PDF" : "https://flygateway.org/wp-content/uploads/2023/05/N469FA-Weight-and-Balance.pdf"
      },
    ];

  }

}
