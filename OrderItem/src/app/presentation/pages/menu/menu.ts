import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true, // Adicione esta linha
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  standalone: true
})
export class Menu {}